export const prerender = false;

import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { getSessionUser, createToken } from "../../../lib/auth";

function getRedirectByRol(rol: string) {
  if (rol === "CONTROLADOR") return "/carga";
  if (rol === "CONSULTA") return "/consulta-sku";
  return "/";
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const usuarioSesion = await getSessionUser(cookies);

  if (!usuarioSesion) {
    return redirect("/login");
  }

  const formData = await request.formData();

  const password = String(formData.get("password") || "");
  const confirmarPassword = String(formData.get("confirmarPassword") || "");

  if (password.length < 8) {
    return redirect("/cambiar-password?error=minimo");
  }

  if (password !== confirmarPassword) {
    return redirect("/cambiar-password?error=no-coincide");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const usuarioActualizado = await prisma.usuario.update({
    where: {
      id: usuarioSesion.id,
    },
    data: {
      password: passwordHash,
      debeCambiarPassword: false,
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

  return redirect(getRedirectByRol(usuarioActualizado.rol));
};