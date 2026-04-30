import type { APIRoute } from "astro";
import { prisma } from "../../../../lib/prisma";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

    const bloqueId = Number(formData.get("bloqueId"));
    const jornadaId = Number(formData.get("jornadaId"));
    const horaInicio = String(formData.get("horaInicio"));
    const horaFin = String(formData.get("horaFin") || "");

    if (!bloqueId || !jornadaId || !horaInicio) {
      return new Response("Faltan datos", { status: 400 });
    }

    const hoy = new Date().toISOString().split("T")[0];

    await prisma.bloqueLinea.update({
      where: { id: bloqueId },
      data: {
        horaInicio: new Date(`${hoy}T${horaInicio}:00`),
        horaFin: horaFin ? new Date(`${hoy}T${horaFin}:00`) : null,
      },
    });

    return redirect(`/produccion/${jornadaId}#bloques`);
  } catch (error) {
    console.error("ERROR EDITANDO BLOQUE:", error);
    return new Response("Error al editar bloque", { status: 500 });
  }
};