export const prerender = false;

import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";

import { prisma } from "../../../../lib/prisma";
import { getSessionUser } from "../../../../lib/auth";

function generarPasswordTemporal() {
  const caracteres =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  let password = "MK-";

  for (let i = 0; i < 8; i++) {
    password += caracteres.charAt(
      Math.floor(
        Math.random() * caracteres.length,
      ),
    );
  }

  return password;
}

export const POST: APIRoute = async ({
  params,
  cookies,
  redirect,
}) => {
  try {
    const id = Number(params.id);

    if (!id || Number.isNaN(id)) {
      return redirect("/usuarios");
    }

    const usuarioSesion =
      await getSessionUser(cookies);

    if (!usuarioSesion) {
      return redirect("/login");
    }

    const usuario =
      await prisma.usuario.findUnique({
        where: { id },
      });

    if (!usuario) {
      return redirect("/usuarios");
    }

    const passwordTemporal =
      generarPasswordTemporal();

    const passwordHash =
      await bcrypt.hash(
        passwordTemporal,
        10,
      );

    await prisma.usuario.update({
      where: { id },

      data: {
        password: passwordHash,

        debeCambiarPassword: true,

        intentosFallidos: 0,

        bloqueadoHasta: null,
      },
    });

    await prisma.auditoria.create({
      data: {
        usuarioId: usuarioSesion.id,

        modulo: "Usuarios",

        accion: "Restableció contraseña",

        detalle: `${usuario.nombre} (${usuario.email})`,
      },
    });

    return redirect(
      `/usuarios/${id}?ok=password&temporal=${encodeURIComponent(
        passwordTemporal,
      )}`,
    );

  } catch (error) {

    console.error(
      "ERROR RESETEANDO PASSWORD:",
      error,
    );

    return new Response(
      "Error al restablecer contraseña",

      {
        status: 500,
      },
    );
  }
};