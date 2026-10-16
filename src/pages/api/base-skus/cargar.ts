export const prerender = false;

import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import * as XLSX from "xlsx";

function normalizarSku(valor: unknown): string {
  return String(valor ?? "").trim().padStart(8, "0");
}

function limpiarTexto(valor: unknown): string | null {
  const texto = String(valor ?? "").trim();
  return texto || null;
}

function numeroONull(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;

  const numero = Number(String(valor).replace(",", "."));
  return Number.isFinite(numero) ? numero : null;
}

function enteroONull(valor: unknown): number | null {
  const numero = numeroONull(valor);
  return numero === null ? null : Math.trunc(numero);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const archivo = formData.get("archivo");

    if (!(archivo instanceof File)) {
      return Response.redirect(
        new URL(
          `/base-skus/cargar?err=${encodeURIComponent("No se recibió archivo.")}`,
          request.url
        ),
        303
      );
    }

    const buffer = Buffer.from(await archivo.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];

    const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, {
      range: 4,
      defval: "",
    });

    let procesados = 0;
    let creados = 0;
    let actualizados = 0;

    for (const fila of filas) {
      const codigo = normalizarSku(fila["imlitm"]);

      if (!codigo) continue;

      const descripcion =
        limpiarTexto(fila["imdsc1"]) ||
        limpiarTexto(fila["Descripción Alterna"]);

      const width = numeroONull(fila["Widht"] ?? fila["Width"]);
      const depth = numeroONull(fila["Depth"]);
      const height = numeroONull(fila["Height"]);
      const cubicaje = numeroONull(fila["Cubicaje"]);
      const pesoBranch = numeroONull(fila["PESO_BRANCH"]);
      const piezasCaja = enteroONull(fila["Piezas en Caja"]);

      procesados++;

      const existente = await prisma.sku.findUnique({
        where: { codigo },
      });

      await prisma.sku.upsert({
        where: { codigo },
        update: {
          descripcion,
          width,
          depth,
          height,
          cubicaje,
          pesoBranch,
          piezasCaja,
          activo: true,
        },
        create: {
          codigo,
          descripcion,
          width,
          depth,
          height,
          cubicaje,
          pesoBranch,
          piezasCaja,
          activo: true,
        },
      });

      if (existente) {
        actualizados++;
      } else {
        creados++;
      }
    }

    return Response.redirect(
      new URL(
        `/base-skus/cargar?ok=1&procesados=${procesados}&creados=${creados}&actualizados=${actualizados}`,
        request.url
      ),
      303
    );
  } catch (error) {
    console.error("ERROR AL CARGAR MAESTRO DE SKUS:", error);

    const detalle =
      error instanceof Error ? error.message : "Error desconocido";

    return Response.redirect(
      new URL(
        `/base-skus/cargar?err=${encodeURIComponent(detalle)}`,
        request.url
      ),
      303
    );
  }
};