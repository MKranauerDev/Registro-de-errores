export const prerender = false;

import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import * as XLSX from "xlsx";
import { EstadoSkuLinea } from "@prisma/client";

function normalizarTexto(valor: unknown): string {
  return String(valor ?? "").trim();
}

function normalizarSku(valor: unknown): string {
  return String(valor ?? "").trim().padStart(8, "0");
}

function posicionValida(posicion: string): boolean {
  return /^[A-Z]{2}\d+$/i.test(posicion);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const archivo = formData.get("archivo");

    if (!(archivo instanceof File)) {
      return Response.redirect(
        new URL(
          `/base-skus/posiciones?err=${encodeURIComponent("No se recibió archivo.")}`,
          request.url
        ),
        303
      );
    }

    const buffer = Buffer.from(await archivo.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];

    const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, {
      range: 10,
      defval: "",
    });

    let procesados = 0;
    let actualizados = 0;
    let sinCambios = 0;
    let noEncontrados = 0;

    for (const fila of filas) {
      const posicion = normalizarTexto(fila["Localidad"]).toUpperCase();
      const codigo = normalizarSku(fila["Artículo"]);

      if (!codigo || !posicion) continue;
      if (!posicionValida(posicion)) continue;

      procesados++;

      const sku = await prisma.sku.findUnique({
        where: { codigo },
      });

      if (!sku) {
        noEncontrados++;
        continue;
      }

      const posicionActual = await prisma.skuPosicionHistorial.findFirst({
        where: {
          skuId: sku.id,
          esActual: true,
        },
      });

      if (posicionActual?.posicion === posicion) {
        sinCambios++;
        continue;
      }

      if (posicionActual) {
        await prisma.skuPosicionHistorial.update({
          where: { id: posicionActual.id },
          data: {
            esActual: false,
            fechaHasta: new Date(),
          },
        });
      }

      await prisma.skuPosicionHistorial.create({
        data: {
          skuId: sku.id,
          posicion,
          estado: EstadoSkuLinea.EN_LINEA,
          esActual: true,
          motivoCambio: "Carga masiva de posiciones",
        },
      });

      actualizados++;
    }

    return Response.redirect(
      new URL(
        `/base-skus/posiciones?ok=1&procesados=${procesados}&actualizados=${actualizados}&sinCambios=${sinCambios}&noEncontrados=${noEncontrados}`,
        request.url
      ),
      303
    );
  } catch (error) {
    console.error("ERROR AL CARGAR POSICIONES:", error);

    const detalle =
      error instanceof Error ? error.message : "Error desconocido";

    return Response.redirect(
      new URL(
        `/base-skus/posiciones?err=${encodeURIComponent(detalle)}`,
        request.url
      ),
      303
    );
  }
};