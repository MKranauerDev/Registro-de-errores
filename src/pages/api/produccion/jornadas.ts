import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

    const fecha = String(formData.get("fecha") || "");
    const mesOperativo = String(formData.get("mesOperativo") || "");
    const observacion = String(formData.get("observacion") || "");

    if (!fecha || !mesOperativo) {
      return new Response("Faltan datos obligatorios", { status: 400 });
    }

    await prisma.jornadaLinea.create({
      data: {
        fecha: new Date(`${fecha}T00:00:00`),
        mesOperativo,
        observacion: observacion || null,
      },
    });

    return redirect("/produccion");
  } catch (error) {
    console.error("ERROR CREANDO JORNADA:", error);
    return new Response("Error al crear la jornada", { status: 500 });
  }
};