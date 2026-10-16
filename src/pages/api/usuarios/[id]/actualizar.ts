export const prerender = false;

import type { APIRoute } from "astro";
import { prisma } from "../../../../lib/prisma";

export const POST: APIRoute = async ({ params, request, redirect }) => {
  try {
    const id = Number(params.id);

    if (!id || Number.isNaN(id)) {
      return redirect("/usuarios");
    }

    const formData = await request.formData();

    const nombre = String(formData.get("nombre") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const rol = String(formData.get("rol") || "CONTROLADOR");
    const controladorIdRaw = String(formData.get("controladorId") || "");
    const activo = formData.get("activo") === "on";

    if (!nombre || !email) {
      return new Response("Faltan datos obligatorios", { status: 400 });
    }

    await prisma.usuario.update({
      where: { id },
      data: {
        nombre,
        email,
        rol: rol as any,
        activo,
        controladorId: controladorIdRaw ? Number(controladorIdRaw) : null,
      },
    });

    return redirect(`/usuarios/${id}?ok=actualizado`);
  } catch (error) {
    console.error("ERROR ACTUALIZANDO USUARIO:", error);
    return new Response("Error al actualizar usuario", { status: 500 });
  }
};