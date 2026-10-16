export const prerender = false;

import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { createToken } from "../../../lib/auth";

function getRedirectByRol(rol: string) {
  if (rol === "CONTROLADOR") return "/carga";
  if (rol === "CONSULTA") return "/consulta-sku";

  return "/";
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return redirect("/login?error=datos");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!usuario) {
    return redirect("/login?error=credenciales");
  }

  if (!usuario.activo) {
    return redirect("/login?error=inactivo");
  }

  if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
    return redirect("/login?error=bloqueado");
  }

  const passwordOk = await bcrypt.compare(password, usuario.password);

  if (!passwordOk) {
    const nuevosIntentos = usuario.intentosFallidos + 1;

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        intentosFallidos: nuevosIntentos,
        bloqueadoHasta:
          nuevosIntentos >= 5
            ? new Date(Date.now() + 15 * 60 * 1000)
            : null,
      },
    });

    return redirect(
      nuevosIntentos >= 5
        ? "/login?error=bloqueado"
        : "/login?error=credenciales",
    );
  }

  const usuarioActualizado = await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      ultimoAcceso: new Date(),
      intentosFallidos: 0,
      bloqueadoHasta: null,
    },
  });

  const token = await createToken({
    id: usuarioActualizado.id,
    nombre: usuarioActualizado.nombre,
    email: usuarioActualizado.email,
    rol: usuarioActualizado.rol,
    controladorId: usuarioActualizado.controladorId,
    debeCambiarPassword: usuarioActualizado.debeCambiarPassword,
  });

  cookies.set("mk_token", token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 8,
  });

  cookies.delete("mk_session", {
    path: "/",
  });

  return redirect(getRedirectByRol(usuarioActualizado.rol));
};