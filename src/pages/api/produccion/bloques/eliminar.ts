import type { APIRoute } from "astro";
import { prisma } from "../../../../lib/prisma";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

    const bloqueId = Number(formData.get("bloqueId"));
    const jornadaId = Number(formData.get("jornadaId"));

    if (!bloqueId || !jornadaId) {
      return new Response("Faltan datos obligatorios", { status: 400 });
    }

    await prisma.bloqueLinea.delete({
      where: {
        id: bloqueId,
      },
    });

    return redirect(`/produccion/${jornadaId}#bloques`);
  } catch (error) {
    console.error("ERROR ELIMINANDO BLOQUE:", error);
    return new Response("Error al eliminar bloque", { status: 500 });
  }
};