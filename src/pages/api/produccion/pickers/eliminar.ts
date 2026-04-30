import type { APIRoute } from "astro";
import { prisma } from "../../../../lib/prisma";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

    const pickerJornadaId = Number(formData.get("pickerJornadaId"));
    const jornadaId = Number(formData.get("jornadaId"));

    if (!pickerJornadaId || !jornadaId) {
      return new Response("Faltan datos", { status: 400 });
    }

    await prisma.pickerJornada.delete({
      where: {
        id: pickerJornadaId,
      },
    });

    return redirect(`/produccion/${jornadaId}`);
  } catch (error) {
    console.error("ERROR ELIMINANDO PICKER:", error);
    return new Response("Error al eliminar picker", { status: 500 });
  }
};