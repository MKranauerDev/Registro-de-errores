export const prerender = false;

import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const codigo = params.codigo;
    const url = new URL(request.url);
    const fechaHoraError = url.searchParams.get("fechaHoraError");

    const fechaHoraErrorDate = fechaHoraError
      ? new Date(fechaHoraError)
      : new Date();

    if (!codigo) {
      return new Response(JSON.stringify({ error: "Código SKU obligatorio." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sku = await prisma.sku.findUnique({
      where: { codigo },
      include: {
        posiciones: {
          where: { esActual: true },
          take: 1,
        },
      },
    });

    if (!sku) {
      return new Response(JSON.stringify({ error: "SKU no encontrado." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const posicionActual = sku.posiciones[0] ?? null;
    const posicion = posicionActual?.posicion ?? null;
    const estacionCodigo = posicion ? posicion.slice(0, 2) : null;

    let pickerDetectado = null;

    if (estacionCodigo) {
      const estacion = await prisma.estacion.findUnique({
        where: { codigo: estacionCodigo },
      });

      if (estacion) {
        const inicioDia = new Date(fechaHoraErrorDate);
        inicioDia.setHours(0, 0, 0, 0);

        const finDia = new Date(fechaHoraErrorDate);
        finDia.setHours(23, 59, 59, 999);

        const jornada = await prisma.jornadaLinea.findFirst({
          where: {
            fecha: {
              gte: inicioDia,
              lte: finDia,
            },
            pickersLinea: {
              some: {
                estacionId: estacion.id,
                activo: true,
                AND: [
                {
                  OR: [
                    { horaDesde: { lte: fechaHoraErrorDate } },
                    { horaDesde: null },
                  ],
                },
                {
                  OR: [
                    { horaHasta: { gte: fechaHoraErrorDate } },
                    { horaHasta: null },
                  ],
                },
              ],
              },
            },
          },
          include: {
            pickersLinea: {
              where: {
                estacionId: estacion.id,
                activo: true,
                AND: [
  {
    OR: [
      { horaDesde: { lte: fechaHoraErrorDate } },
      { horaDesde: null },
    ],
  },
  {
    OR: [
      { horaHasta: { gte: fechaHoraErrorDate } },
      { horaHasta: null },
    ],
  },
],
              },
              include: {
                picker: true,
              },
              take: 1,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        const pickerJornada = jornada?.pickersLinea[0];

        if (pickerJornada) {
          pickerDetectado = {
            id: pickerJornada.picker.id,
            nombre: pickerJornada.picker.nombre,
          };
        }
      }
    }

    return new Response(
      JSON.stringify({
        id: sku.id,
        codigo: sku.codigo,
        descripcion: sku.descripcion,
        pesoBranch: sku.pesoBranch,
        cubicaje: sku.cubicaje,
        piezasCaja: sku.piezasCaja,
        posicion,
        estacion: estacionCodigo,
        pickerDetectado,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("ERROR CONSULTANDO SKU:", error);

    return new Response(
      JSON.stringify({ error: "Error interno consultando SKU." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};