export const prerender = false;

import type { APIRoute } from "astro";
import { prisma } from "../../lib/prisma";
import { ResultadoControl } from "@prisma/client";

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get("content-type") || "";
    console.log("CONTENT-TYPE RECIBIDO:", contentType);

    let mesOperativo: FormDataEntryValue | null = null;
    let remito: FormDataEntryValue | null = null;
    let cbi: FormDataEntryValue | null = null;
    let resultadoControl: FormDataEntryValue | null = null;
    let cantidad: FormDataEntryValue | null = null;
    let observacion: FormDataEntryValue | null = null;
    let estacionId: FormDataEntryValue | null = null;
    let pickerId: FormDataEntryValue | null = null;
    let skuCodigo: FormDataEntryValue | null = null;
    let controladorId: FormDataEntryValue | null = null;

    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const formData = await request.formData();

      mesOperativo = formData.get("mesOperativo");
      remito = formData.get("remito");
      cbi = formData.get("cbi");
      resultadoControl = formData.get("resultadoControl");
      cantidad = formData.get("cantidad");
      observacion = formData.get("observacion");
      estacionId = formData.get("estacionId");
      pickerId = formData.get("pickerId");
      skuCodigo = formData.get("skuCodigo");
      controladorId = formData.get("controladorId");
    } else if (contentType.includes("application/json")) {
      const body = await request.json();

      mesOperativo = body.mesOperativo;
      remito = body.remito;
      cbi = body.cbi;
      resultadoControl = body.resultadoControl;
      cantidad = body.cantidad;
      observacion = body.observacion;
      estacionId = body.estacionId;
      pickerId = body.pickerId;
      skuCodigo = body.skuCodigo;
      controladorId = body.controladorId;
    } else {
      return new Response(
        JSON.stringify({
          error: "Tipo de contenido no soportado.",
          detalle: `Content-Type recibido: ${contentType || "vacío"}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("FORM DATA RECIBIDA:", {
      mesOperativo,
      remito,
      cbi,
      resultadoControl,
      cantidad,
      observacion,
      estacionId,
      pickerId,
      skuCodigo,
      controladorId,
    });

    if (
      !mesOperativo ||
      !remito ||
      !cbi ||
      !resultadoControl ||
      !estacionId ||
      !pickerId ||
      !skuCodigo ||
      !controladorId
    ) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const sku = await prisma.sku.findFirst({
      where: {
        codigo: String(skuCodigo),
      },
    });

    console.log("SKU ENCONTRADO:", sku);

    if (!sku) {
      return new Response(
        JSON.stringify({ error: "El SKU ingresado no existe en la base." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const relevamiento = await prisma.relevamiento.create({
      data: {
        mesOperativo: String(mesOperativo),
        remito: String(remito),
        cbi: String(cbi),
        resultadoControl: String(resultadoControl) as ResultadoControl,
        cantidad: Number(cantidad) || 1,
        observacion: observacion ? String(observacion) : null,
        estacionId: Number(estacionId),
        pickerId: Number(pickerId),
        skuId: sku.id,
        controladorId: Number(controladorId),
      },
    });

    console.log("RELEVAMIENTO CREADO:", relevamiento);

    return new Response(JSON.stringify(relevamiento), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ERROR AL GUARDAR RELEVAMIENTO:", error);

    const detalle =
      error instanceof Error ? error.message : "Error desconocido";

    return new Response(
      JSON.stringify({
        error: "Error interno al guardar relevamiento.",
        detalle,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};