export const prerender = false;

import type { APIRoute } from "astro";
import { prisma } from "../../../lib/prisma";
import { obtenerConfiguracionEtiqueta } from "../../../lib/etiquetas/configuracion";
import { getSessionUser } from "../../../lib/auth";

export const GET: APIRoute = async ({ url, cookies }) => {
  const usuario = await getSessionUser(cookies);

  if (!usuario) {
    return Response.json(
      { ok: false, error: "Sesión inválida." },
      { status: 401 }
    );
  }

  if (!["ADMIN", "SUPERVISOR"].includes(usuario.rol)) {
    return Response.json(
      { ok: false, error: "No tenés permisos para imprimir etiquetas." },
      { status: 403 }
    );
  }

  const busqueda = url.searchParams.get("q")?.trim().toUpperCase();

  if (!busqueda) {
    return Response.json(
      { ok: false, error: "Ingresá un SKU o una posición." },
      { status: 400 }
    );
  }

  try {
    const sku = await prisma.sku.findUnique({
      where: { codigo: busqueda },
      select: {
        codigo: true,
        descripcion: true,
        imagenUrl: true,
        activo: true,
        posiciones: {
          where: { esActual: true },
          select: {
            posicion: true,
            estado: true,
          },
        },
      },
    });

    let resultado = sku;

    if (!resultado) {
      const ubicacion = await prisma.skuPosicionHistorial.findFirst({
        where: {
          posicion: busqueda,
          esActual: true,
          estado: "EN_LINEA",
        },
        include: {
          sku: {
            select: {
              codigo: true,
              descripcion: true,
              imagenUrl: true,
              activo: true,
              posiciones: {
                where: { esActual: true },
                select: {
                  posicion: true,
                  estado: true,
                },
              },
            },
          },
        },
      });

      resultado = ubicacion?.sku ?? null;
    }

    if (!resultado) {
      return Response.json(
        { ok: false, error: "No se encontró el SKU o la posición." },
        { status: 404 }
      );
    }

    if (!resultado.activo) {
      return Response.json(
        { ok: false, error: "El SKU está inactivo." },
        { status: 409 }
      );
    }

    const vigente = resultado.posiciones.find(
      (p) => p.estado === "EN_LINEA" && p.posicion
    );

    if (!vigente?.posicion) {
      return Response.json(
        {
          ok: false,
          error: "El SKU no tiene una posición vigente en línea.",
        },
        { status: 409 }
      );
    }
    const asignaciones = await prisma.skuPosicionHistorial.findMany({
      where: {
        posicion: vigente.posicion,
        esActual: true,
        estado: "EN_LINEA",
      },
      select: {
        skuId: true,
      },
      take: 2,
    });

    if (asignaciones.length > 1) {
      return Response.json(
        {
          ok: false,
          error: "Hay más de un SKU asignado a esta posición. Revisá los datos antes de imprimir.",
        },
        { status: 409 }
      );
    }
    const configuracion = obtenerConfiguracionEtiqueta(vigente.posicion);

    if (!configuracion) {
      return Response.json(
        {
          ok: false,
          error: "La posición no está configurada para imprimir etiquetas.",
        },
        { status: 409 }
      );
    }

    return Response.json({
      ok: true,
      sku: {
        codigo: resultado.codigo,
        descripcion: resultado.descripcion,
        imagenUrl: resultado.imagenUrl,
      },
      etiqueta: configuracion,
    });
  } catch (error) {
    console.error("Error buscando etiqueta:", error);

    return Response.json(
      { ok: false, error: "Error al consultar la base de datos." },
      { status: 500 }
    );
  }
};