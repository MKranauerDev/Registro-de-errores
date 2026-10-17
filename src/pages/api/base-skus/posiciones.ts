export const prerender = false;
import type { APIRoute } from "astro";
// Ruta antigua deshabilitada: todas las escrituras requieren vista previa y confirmación.
export const POST: APIRoute = async () => Response.json({ ok: false, error: "Usá Analizar posiciones y luego Confirmar actualización." }, { status: 405 });
