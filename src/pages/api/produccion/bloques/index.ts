import type { APIRoute } from "astro";
import { prisma } from "../../../../lib/prisma";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

    const jornadaId = Number(formData.get("jornadaId"));
    const tipo = String(formData.get("tipo"));
    const horaInicio = String(formData.get("horaInicio"));
    const horaFin = String(formData.get("horaFin") || "");
    const observacion = String(formData.get("observacion") || "");

    if (!jornadaId || !tipo || !horaInicio) {
      return new Response("Faltan datos", { status: 400 });
    }

    const hoy = new Date();

    const inicio = new Date(
      `${hoy.toISOString().split("T")[0]}T${horaInicio}:00`
    );

    const fin = horaFin
      ? new Date(`${hoy.toISOString().split("T")[0]}T${horaFin}:00`)
      : null;

      const ultimoBloqueAbierto = await prisma.bloqueLinea.findFirst({
        where: {
          jornadaId,
          horaFin: null,
        },
        orderBy: {
          horaInicio: "desc",
        },
      });

      if (ultimoBloqueAbierto) {
        await prisma.bloqueLinea.update({
          where: { id: ultimoBloqueAbierto.id },
          data: {
            horaFin: inicio,
          },
        });
      }
    await prisma.bloqueLinea.create({
      data: {
        jornadaId,
        tipo: tipo as any,
        horaInicio: inicio,
        horaFin: fin,
        observacion: observacion || null,
      },
    });

    return redirect(`/produccion/${jornadaId}#bloques`);
  } catch (error) {
    console.error("ERROR BLOQUE:", error);
    return new Response("Error al guardar bloque", { status: 500 });
  }
};