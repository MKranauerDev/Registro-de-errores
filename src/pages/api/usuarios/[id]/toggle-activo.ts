export const prerender = false;

import type { APIRoute } from "astro";
import { prisma } from "../../../../lib/prisma";
import { getSessionUser } from "../../../../lib/auth";

export const POST: APIRoute = async ({ params, cookies, redirect }) => {
  try {
    const id = Number(params.id);

    if (!id || Number.isNaN(id)) {
      return redirect("/usuarios");
    }

    const usuarioSesion = await getSessionUser(cookies);

    if (!usuarioSesion) {
      return redirect("/login");
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      return redirect("/usuarios");
    }

    const nuevoEstado = !usuario.activo;

    await prisma.usuario.update({
      where: { id },
      data: {
        activo: nuevoEstado,
      },
    });

    await prisma.auditoria.create({
      data: {
        usuarioId: usuarioSesion.id,
        modulo: "Usuarios",
        accion: nuevoEstado ? "Activó usuario" : "Desactivó usuario",
        detalle: `${usuario.nombre} (${usuario.email})`,
      },
    });

    return redirect(
      `/usuarios/${id}?ok=${nuevoEstado ? "activado" : "desactivado"}`,
    );
  } catch (error) {
    console.error("ERROR CAMBIANDO ESTADO USUARIO:", error);
    return new Response("Error al cambiar estado del usuario", { status: 500 });
  }
};