import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

    const jornadaId = Number(formData.get("jornadaId"));
    const pickerId = Number(formData.get("pickerId"));
    const estacionId = Number(formData.get("estacionId"));

    const horaDesde = String(formData.get("horaDesde") || "");
    const horaHasta = String(formData.get("horaHasta") || "");

    const hoy = new Date().toISOString().split("T")[0];

    await prisma.pickerJornada.create({
      data: {
        jornadaId,
        pickerId,
        estacionId,
        horaDesde: horaDesde ? new Date(`${hoy}T${horaDesde}:00`) : null,
        horaHasta: horaHasta ? new Date(`${hoy}T${horaHasta}:00`) : null,
      },
    });

    return redirect(`/produccion/${jornadaId}`);
  } catch (error) {
    console.error("ERROR PICKER:", error);
    return new Response("Error al guardar picker", { status: 500 });
  }
};