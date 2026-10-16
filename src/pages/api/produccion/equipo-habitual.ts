import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

    const estaciones = await prisma.estacion.findMany({
      where: { activo: true },
    });

    for (const estacion of estaciones) {
      const pickerId = Number(formData.get(`estacion-${estacion.id}`));

      if (!pickerId) {
        await prisma.equipoHabitual.deleteMany({
          where: { estacionId: estacion.id },
        });

        continue;
      }

      await prisma.equipoHabitual.upsert({
        where: {
          estacionId: estacion.id,
        },
        update: {
          pickerId,
        },
        create: {
          estacionId: estacion.id,
          pickerId,
        },
      });
    }

    return redirect("/produccion");
  } catch (error) {
    console.error("ERROR GUARDANDO EQUIPO HABITUAL:", error);
    return new Response("Error al guardar equipo habitual", { status: 500 });
  }
};