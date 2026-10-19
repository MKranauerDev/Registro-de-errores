export const permisos = {
  ADMIN: [
    "/",
    "/produccion",
    "/carga",
    "/base-skus",
    "/cargar-posiciones",
    "/consulta-sku",
    "/etiquetas",
    "/mapa-linea",
    "/reportes",
    "/usuarios",
  ],

  SUPERVISOR: [
    "/",
    "/produccion",
    "/carga",
    "/base-skus",
    "/cargar-posiciones",
    "/consulta-sku",
    "/etiquetas",
    "/mapa-linea",
    "/reportes",
  ],

  CONTROLADOR: ["/carga"],

  CONSULTA: ["/consulta-sku", "/reportes"],
} as const;

export function tienePermiso(rol: string, ruta: string) {
  const rutas = permisos[rol as keyof typeof permisos];

  if (!rutas) {
    return false;
  }

  return rutas.some((rutaPermitida) => {
    return ruta === rutaPermitida || ruta.startsWith(`${rutaPermitida}/`);
  });
}