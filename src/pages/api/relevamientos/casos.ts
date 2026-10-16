export const prerender = false;

import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { ResultadoControl } from "@prisma/client";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const {
      mesOperativo,
      remito,
      cbi,
      fechaHoraError,
      controladorId,
      observacion,
      items,
    } = body;

    const fechaHoraErrorDate = fechaHoraError 
        ? new Date(fechaHoraError)
        : new Date();

    if (!mesOperativo || !remito || !cbi || !controladorId) {
      return new Response(
        JSON.stringify({ error: "Faltan datos generales obligatorios." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Debe cargar al menos un SKU." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const inicioDia = new Date(fechaHoraErrorDate);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(fechaHoraErrorDate);
    finDia.setHours(23, 59, 59, 999);

    const itemsProcesados = [];

    for (const item of items) {
      const skuCodigo = String(item.skuCodigo || "").trim();
      const resultadoControl = String(item.resultadoControl || "");
      const cantidad = Number(item.cantidad || 0);

      if (!skuCodigo || !resultadoControl || cantidad <= 0) {
        return new Response(
          JSON.stringify({
            error: "Cada ítem debe tener SKU, resultado y cantidad mayor a 0.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const sku = await prisma.sku.findUnique({
        where: { codigo: skuCodigo },
        include: {
          posiciones: {
            where: { esActual: true },
            take: 1,
          },
        },
      });

      if (!sku) {
        return new Response(
          JSON.stringify({ error: `El SKU ${skuCodigo} no existe.` }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const posicionActual = sku.posiciones[0] ?? null;
      const posicion = posicionActual?.posicion ?? null;
      const estacionCodigo = posicion ? posicion.slice(0, 2) : null;

      if (!estacionCodigo) {
        return new Response(
          JSON.stringify({
            error: `El SKU ${skuCodigo} no tiene posición actual.`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const estacion = await prisma.estacion.findUnique({
        where: { codigo: estacionCodigo },
      });

      if (!estacion) {
        return new Response(
          JSON.stringify({
            error: `No existe la estación ${estacionCodigo} para el SKU ${skuCodigo}.`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

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
                AND: [{
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
                },],
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

      const pickerJornada = jornada?.pickersLinea[0] ?? null;

      if (!pickerJornada) {
        return new Response(
          JSON.stringify({
            error: `No hay un picker asignado a ${estacion.codigo} para ese horario.`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const picker = pickerJornada.picker;

      itemsProcesados.push({
        skuId: sku.id,
        estacionId: estacion.id,
        pickerId: picker.id,
        resultadoControl: resultadoControl as ResultadoControl,
        cantidad,
        posicionSkuAlMomento: posicion,
        estadoSkuAlMomento: posicionActual?.estado ?? null,
        pickerAlMomento: picker.nombre,
      });
    }

    const caso = await prisma.relevamientoCaso.create({
      data: {
        fechaHoraError: fechaHoraErrorDate,
        mesOperativo: String(mesOperativo),
        remito: String(remito),
        cbi: String(cbi),
        controladorId: Number(controladorId),
        observacion: observacion ? String(observacion) : null,
        items: {
          create: itemsProcesados,
        },
      },
      include: {
        items: true,
      },
    });

    return new Response(JSON.stringify(caso), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ERROR CREANDO CASO DE RELEVAMIENTO:", error);

    return new Response(
      JSON.stringify({ error: "Error interno al guardar el caso." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};