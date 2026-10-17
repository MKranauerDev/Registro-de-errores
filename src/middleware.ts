import { defineMiddleware } from "astro:middleware";
import { verifyToken } from "./lib/auth";
import { tienePermiso } from "./lib/permisos";

function getRedirectByRol(rol: string) {
  if (rol === "CONTROLADOR") return "/carga";
  if (rol === "CONSULTA") return "/consulta-sku";
  return "/";
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const pathname = url.pathname;

  if (
    pathname.startsWith("/_astro") ||
    pathname.startsWith("/@id") ||
    pathname.startsWith("/@vite") ||
    pathname.startsWith("/node_modules") ||
    pathname === "/favicon.ico"
  ) {
    return next();
  }

  if (pathname.startsWith("/api/auth")) {
    return next();
  }

  const token = cookies.get("mk_token")?.value;

  if (pathname === "/login") {
    if (!token) return next();

    const usuario = await verifyToken(token);

    if (!usuario) {
      cookies.delete("mk_token", { path: "/" });
      return next();
    }

    if (usuario.debeCambiarPassword) {
      return redirect("/cambiar-password");
    }

    return redirect(getRedirectByRol(usuario.rol));
  }

  if (!token) {
    return redirect("/login");
  }

  const usuario = await verifyToken(token);

  if (!usuario) {
    cookies.delete("mk_token", { path: "/" });
    return redirect("/login");
  }

  if (usuario.debeCambiarPassword) {
    if (pathname === "/cambiar-password") {
      return next();
    }

    if (pathname.startsWith("/api/password")) {
      return next();
    }

    return redirect("/cambiar-password");
  }

  // Proteger todas las API de actualización de posiciones.
if (
  pathname === "/api/base-skus/posiciones" ||
  pathname.startsWith("/api/base-skus/posiciones/")
) {
  if (!["ADMIN", "SUPERVISOR"].includes(usuario.rol)) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "No tenés permisos para actualizar posiciones.",
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return next();
}

// Mantener el comportamiento de las demás API.
if (pathname.startsWith("/api")) {
  return next();
}

  const permiso = tienePermiso(usuario.rol, pathname);

  if (!permiso) {
    return redirect(getRedirectByRol(usuario.rol));
  }

  return next();
});