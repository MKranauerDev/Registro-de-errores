import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma"; // Ajustar SOLO si tu cliente Prisma está en otra ruta.
import { distribucion } from "../../../lib/mapa-linea/distribucion";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const codigo = url.searchParams.get("codigo")?.trim().toUpperCase() ?? "";
  const estacion = codigo.slice(0, 2);
  if (!Object.prototype.hasOwnProperty.call(distribucion, estacion) ||
      !distribucion[estacion]?.some((p) => p.codigo === codigo)) {
    return Response.json({ error: "Posición no válida" }, { status: 400 });
  }

  try {
    const registros = await prisma.skuPosicionHistorial.findMany({
      where: { posicion: codigo, esActual: true, estado: "EN_LINEA" },
      select: {
        fechaDesde: true,
        sku: {
          select: {
            codigo: true, descripcion: true, width: true, depth: true,
            height: true, cubicaje: true, pesoBranch: true,
            piezasCaja: true, imagenUrl: true,
          },
        },
      },
      take: 2,
    });

    if (registros.length > 1) {
      return Response.json({ error: "Hay más de un SKU actual en esta posición. Revisar datos." }, { status: 409 });
    }
    if (registros.length === 0) {
      return Response.json({ posicion: codigo, ocupada: false, sku: null });
    }
    const registro = registros[0];
    return Response.json({
      posicion: codigo, ocupada: true,
      fechaDesde: registro.fechaDesde.toISOString(),
      sku: registro.sku,
    });
  } catch (error) {
    console.error("Error al consultar posición del mapa:", error);
    return Response.json({ error: "No se pudo consultar la posición" }, { status: 500 });
  }
};
