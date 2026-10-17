export const prerender = false;

import type { APIRoute } from "astro";
import { prisma } from "../../../../lib/prisma";
import { leerExcel, analizar } from "../../../../lib/posiciones/analisis";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const archivo = data.get("archivo");

    if (
      !(archivo instanceof File) ||
      !/\.(xlsx|xls)$/i.test(archivo.name)
    ) {
      throw new Error("Seleccioná un Excel .xlsx o .xls.");
    }

    const excel = leerExcel(
      Buffer.from(await archivo.arrayBuffer())
    );

    const resultado = await analizar(prisma, excel);

    const { skus, registrosLinea, vigentes, ...publico } = resultado;

    return Response.json(publico);
  } catch (e) {
    return Response.json(
      {
        ok: false,
        error:
          e instanceof Error
            ? e.message
            : "Error al analizar.",
      },
      { status: 400 }
    );
  }
};