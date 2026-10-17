
import * as XLSX from "xlsx";
import { createHash } from "node:crypto";
import { EstadoSkuLinea, type Prisma } from "@prisma/client";

type Db = Pick<
  Prisma.TransactionClient,
  "sku" | "skuPosicionHistorial"
>;

export type Cambio = {
  codigo: string;
  anterior: string | null;
  nueva: string | null;
};

const texto = (v: unknown) => String(v ?? "").trim();

const codigoSku = (v: unknown) => {
  const s = texto(v);
  return s ? s.padStart(8, "0") : "";
};

const pos = (v: unknown) => texto(v).toUpperCase();

const valido = (p: string) => /^X[A-H]\d+$/.test(p);

const digest = (value: unknown) =>
  createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");

export function leerExcel(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const hoja = workbook.Sheets[workbook.SheetNames[0]];

  if (!hoja) {
    throw new Error("El archivo no contiene hojas válidas.");
  }

  const encabezados = (
    XLSX.utils.sheet_to_json<unknown[]>(hoja, {
      range: 10,
      header: 1,
      blankrows: false,
    })[0] ?? []
  ).map(texto);

  if (
    !encabezados.includes("Localidad") ||
    !encabezados.includes("Artículo")
  ) {
    throw new Error(
      'No se encontraron "Localidad" y "Artículo" en la fila 11.'
    );
  }

  const filas = XLSX.utils.sheet_to_json<
    Record<string, unknown>
  >(hoja, {
    range: 10,
    defval: "",
  });

  const porSku = new Map<string, string>();
  const porPosicion = new Map<string, string>();
  const errores: string[] = [];

  let filasValidas = 0;

  for (const [i, fila] of filas.entries()) {
    const codigo = codigoSku(fila["Artículo"]);
    const posicion = pos(fila["Localidad"]);

    if (!codigo && !posicion) continue;

    if (!codigo || !posicion || !valido(posicion)) {
      errores.push(
        `Fila ${i + 12}: SKU o posición inválida (${codigo} / ${posicion}).`
      );
      continue;
    }

    filasValidas++;

    const anterior = porSku.get(codigo);
    const ocupante = porPosicion.get(posicion);

    if (anterior && anterior !== posicion) {
      errores.push(
        `SKU ${codigo}: aparece en ${anterior} y ${posicion}.`
      );
    }

    if (ocupante && ocupante !== codigo) {
      errores.push(
        `Posición ${posicion}: aparece con ${ocupante} y ${codigo}.`
      );
    }

    if (anterior === posicion) {
      errores.push(
        `Fila ${i + 12}: asignación repetida ${codigo} / ${posicion}.`
      );
    }

    porSku.set(codigo, posicion);
    porPosicion.set(posicion, codigo);
  }

  if (!porSku.size) {
    throw new Error(
      "El Excel no contiene asignaciones válidas."
    );
  }

  return {
    porSku,
    errores,
    filasValidas,
    hashArchivo: createHash("sha256")
      .update(buffer)
      .digest("hex"),
  };
}

export async function analizar(
  db: Db,
  excel: ReturnType<typeof leerExcel>
) {
  const codigos = [...excel.porSku.keys()];

  const [skus, vigentes] = await Promise.all([
    db.sku.findMany({
      where: {
        codigo: { in: codigos },
      },
      select: {
        id: true,
        codigo: true,
      },
    }),

    db.skuPosicionHistorial.findMany({
      where: {
        esActual: true,
      },
      select: {
        id: true,
        skuId: true,
        posicion: true,
        estado: true,
        fechaDesde: true,
        sku: {
          select: {
            codigo: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    }),
  ]);

  const encontrados = new Set(
    skus.map((s) => s.codigo)
  );

  const noEncontrados = codigos.filter(
    (codigo) => !encontrados.has(codigo)
  );

  const errores = [...excel.errores];

  if (noEncontrados.length) {
    errores.push(
      `${noEncontrados.length} SKU no existen en el maestro.`
    );
  }

  const actualesPorSku = new Map<
    string,
    Set<string>
  >();

  const actualesPorPosicion = new Map<
    string,
    Set<string>
  >();

  // Solo las asignaciones físicas válidas forman
  // parte de los movimientos, altas y retiros.
  const registrosLinea = vigentes.filter(
    (r) =>
      r.estado === EstadoSkuLinea.EN_LINEA &&
      valido(pos(r.posicion))
  );

  for (const r of registrosLinea) {
    const posicion = pos(r.posicion);

    if (!actualesPorSku.has(r.sku.codigo)) {
      actualesPorSku.set(
        r.sku.codigo,
        new Set()
      );
    }

    actualesPorSku
      .get(r.sku.codigo)!
      .add(posicion);

    if (!actualesPorPosicion.has(posicion)) {
      actualesPorPosicion.set(
        posicion,
        new Set()
      );
    }

    actualesPorPosicion
      .get(posicion)!
      .add(r.sku.codigo);
  }

  // Detectar posiciones con más de un registro
  // vigente, incluso si corresponden al mismo SKU.
  const cantidadPorPosicion = new Map<
    string,
    number
  >();

  for (const r of registrosLinea) {
    const posicion = pos(r.posicion);

    cantidadPorPosicion.set(
      posicion,
      (cantidadPorPosicion.get(posicion) ?? 0) + 1
    );
  }

  const duplicadas = [
    ...actualesPorPosicion.entries(),
  ]
    .filter(
      ([posicion]) =>
        (cantidadPorPosicion.get(posicion) ?? 0) > 1
    )
    .map(([posicion, codigos]) => ({
      posicion,
      codigos: [...codigos].sort(),
    }))
    .sort((a, b) =>
      a.posicion.localeCompare(b.posicion)
    );

  const movimientos: Cambio[] = [];
  const nuevos: Cambio[] = [];
  const retirados: Cambio[] = [];

  const sinCambios: {
    codigo: string;
    posicion: string;
  }[] = [];

  for (const [codigo, nueva] of excel.porSku) {
    const anteriores = [
      ...(actualesPorSku.get(codigo) ?? []),
    ].sort();

    if (anteriores.includes(nueva)) {
      sinCambios.push({
        codigo,
        posicion: nueva,
      });
    } else if (anteriores.length) {
      movimientos.push({
        codigo,
        anterior: anteriores.join(", "),
        nueva,
      });
    } else {
      nuevos.push({
        codigo,
        anterior: null,
        nueva,
      });
    }
  }

  for (const [codigo, posiciones] of actualesPorSku) {
    if (!excel.porSku.has(codigo)) {
      retirados.push({
        codigo,
        anterior: [...posiciones]
          .sort()
          .join(", "),
        nueva: null,
      });
    }
  }

  // Detecta cambios en los registros vigentes
  // entre la vista previa y la confirmación.
  const snapshot = digest({
    vigentes: vigentes.map((r) => [
      r.id,
      r.skuId,
      r.posicion,
      r.estado,
      r.fechaDesde,
    ]),
    skus: skus
      .map((s) => [s.id, s.codigo])
      .sort((a, b) =>
        String(a[1]).localeCompare(String(b[1]))
      ),
  });

  return {
    ok: true,
    puedeConfirmar: errores.length === 0,
    snapshot,
    hashArchivo: excel.hashArchivo,

    resumen: {
      filasValidas: excel.filasValidas,
      skusExcel: excel.porSku.size,
      movimientos: movimientos.length,
      nuevos: nuevos.length,
      retirados: retirados.length,
      sinCambios: sinCambios.length,
      posicionesDuplicadasActuales:
        duplicadas.length,
      skuNoEncontrados: noEncontrados.length,
      inconsistenciasExcel: errores.length,
    },

    detalle: {
      movimientos,
      nuevos,
      retirados,
      sinCambios,
      duplicadas,
      noEncontrados,
      errores,
    },

    aviso:
      "Vista previa de solo lectura. No se modificó la base de datos.",

    // Datos internos utilizados por confirmar.ts.
    skus,
    registrosLinea,
    vigentes,
  };
}
