export const prerender = false;

import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

    const nombre = String(formData.get("nombre") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const rol = String(formData.get("rol") || "CONTROLADOR");
    const controladorIdRaw = String(formData.get("controladorId") || "");
    const activo = formData.get("activo") === "on";

    if (!nombre || !email || !password) {
      return new Response("Faltan datos obligatorios", { status: 400 });
    }

    const existe = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existe) {
      return new Response("Ya existe un usuario con ese email", { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: passwordHash,
        rol: rol as any,
        activo,
        controladorId: controladorIdRaw ? Number(controladorIdRaw) : null,
      },
    });

    return redirect("/usuarios");
  } catch (error) {
    console.error("ERROR CREANDO USUARIO:", error);
    return new Response("Error al crear usuario", { status: 500 });
  }
};