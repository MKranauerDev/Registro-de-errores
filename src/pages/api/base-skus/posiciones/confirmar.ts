export const prerender = false;
import type { APIRoute } from "astro";
import { Prisma, EstadoSkuLinea } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../lib/auth";
import { leerExcel, analizar } from "../../../../lib/posiciones/analisis";

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get("mk_token")?.value;
  const usuario = token ? await verifyToken(token) : null;
  if (!usuario) return Response.json({ ok: false, error: "Sesión inválida." }, { status: 401 });
  if (!["ADMIN", "SUPERVISOR"].includes(usuario.rol)) return Response.json({ ok: false, error: "Sin permisos." }, { status: 403 });
  try {
    const form = await request.formData();
    const archivo = form.get("archivo");
    const snapshot = form.get("snapshot");
    const hashArchivo = form.get("hashArchivo");
    if (!(archivo instanceof File) || !/\.(xlsx|xls)$/i.test(archivo.name) || typeof snapshot !== "string" || typeof hashArchivo !== "string") {
      throw new Error("Falta el Excel o la referencia de la vista previa.");
    }
    const excel = leerExcel(Buffer.from(await archivo.arrayBuffer()));
    if (excel.hashArchivo !== hashArchivo) return Response.json({ ok: false, error: "El Excel cambió desde el análisis. Volvé a analizarlo." }, { status: 409 });
    const resultado = await prisma.$transaction(async (tx) => {
  // Bloqueo transaccional para evitar confirmaciones simultáneas.
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(734219, 1)`;

  const estado = await analizar(tx, excel);
      if (!estado.puedeConfirmar) throw new Error("El Excel tiene inconsistencias. No se aplicaron cambios.");
      if (estado.snapshot !== snapshot) throw new Error("Las posiciones o el maestro cambiaron desde la vista previa. Volvé a analizar.");
      const ahora = new Date();
      const idPorCodigo = new Map(estado.skus.map(s => [s.codigo, s.id]));
      const idsConservar = new Set<number>();
      const presentes = new Set<string>();

// Conservar una única asignación EN_LINEA por SKU,
// siempre que coincida con la posición del Excel.
for (const r of estado.registrosLinea) {
  const codigo = r.sku.codigo;
  const deseada = excel.porSku.get(codigo);

  if (
    deseada === r.posicion?.trim().toUpperCase() &&
    !presentes.has(codigo)
  ) {
    idsConservar.add(r.id);
    presentes.add(codigo);
  }
}

// Conservar un único registro FUERA_LINEA para los
// SKU que continúan ausentes del Excel.
const fueraLineaConservados = new Set<number>();

for (const r of estado.vigentes) {
  if (
    !excel.porSku.has(r.sku.codigo) &&
    r.estado === EstadoSkuLinea.FUERA_DE_LINEA &&
    !fueraLineaConservados.has(r.skuId)
  ) {
    idsConservar.add(r.id);
    fueraLineaConservados.add(r.skuId);
  }
}

// Cerrar solamente los registros vigentes
// que no corresponde conservar.
const cerrar = estado.vigentes
  .filter((r) => !idsConservar.has(r.id))
  .map((r) => r.id);

if (cerrar.length) {
  await tx.skuPosicionHistorial.updateMany({
    where: { id: { in: cerrar } },
    data: {
      esActual: false,
      fechaHasta: ahora,
    },
  });
}

let creadas = 0;
let fueraLineaCreados = 0;

// Crear las nuevas asignaciones en línea.
for (const [codigo, posicion] of excel.porSku) {
  if (presentes.has(codigo)) continue;

  const skuId = idPorCodigo.get(codigo);

  if (!skuId) {
    throw new Error(`SKU ${codigo} no encontrado.`);
  }

  await tx.skuPosicionHistorial.create({
    data: {
      skuId,
      posicion,
      estado: EstadoSkuLinea.EN_LINEA,
      esActual: true,
      fechaDesde: ahora,
      motivoCambio: "Carga WMS confirmada",
    },
  });

  creadas++;
}

// Registrar como FUERA_LINEA los SKU retirados.
// Si ya estaban FUERA_LINEA, conservar su registro.
const skuIdsRetirados = new Set(
  estado.vigentes
    .filter(
      (r) =>
        !excel.porSku.has(r.sku.codigo) &&
        r.estado === EstadoSkuLinea.EN_LINEA
    )
    .map((r) => r.skuId)
);


for (const skuId of skuIdsRetirados) {
  // Si ya existe un FUERA_LINEA conservado,
  // no generar un registro nuevo.
  if (fueraLineaConservados.has(skuId)) {
    continue;
  }

  await tx.skuPosicionHistorial.create({
    data: {
      skuId,
      posicion: null,
      estado: EstadoSkuLinea.FUERA_DE_LINEA,
      esActual: true,
      fechaDesde: ahora,
      motivoCambio: "Retiro de línea por carga WMS",
    },
  });

  fueraLineaCreados++;
}


return {
  ...estado.resumen,
  cerradas: cerrar.length,
  creadas,
  fueraLineaCreados,
};

    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 120000, maxWait: 10000 });
    return Response.json({ ok: true, resultado });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Error de actualización. No se guardaron cambios." }, { status: 409 });
  }
};
