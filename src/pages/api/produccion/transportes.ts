import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

    const jornadaId = Number(formData.get("jornadaId"));
    const transporte = String(formData.get("transporte"));
    const cantidad = Number(formData.get("cantidad"));
    const pallets = Number(formData.get("pallets") || 0);

    if (!jornadaId || !transporte || Number.isNaN(cantidad)) {
      return new Response("Faltan datos obligatorios", { status: 400 });
    }

    await prisma.produccionTransporte.upsert({
        where: {
            jornadaId_transporte: {
                jornadaId,
                transporte: transporte as any,
            },
        },
        update: {
            cantidad,
            pallets,
        },
        create: {
            jornadaId,
            transporte: transporte as any,
            cantidad,
            pallets,
        },
    });

    return redirect(`/produccion/${jornadaId}`);
  } catch (error) {
    console.error("ERROR PRODUCCIÓN TRANSPORTE:", error);
    return new Response("Error al guardar producción", { status: 500 });
  }
};