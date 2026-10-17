export const menuPorRol = {
  ADMIN: [
    { nombre: "Inicio", ruta: "/" },

    { nombre: "Producción", ruta: "/produccion" },

    { nombre: "Control de errores", ruta: "/carga" },

    { nombre: "Base de SKUs", ruta: "/base-skus" },

    {
      nombre: "Cargar posiciones",
      ruta: "/skus/cargar-posiciones",
    },

    {
      nombre: "Consulta SKU",
      ruta: "/consulta-sku",
    },
    {
      nombre: "Mapa de línea",
      ruta: "/mapa-linea",
    },
    {
      nombre: "Reportes",
      ruta: "/reportes",
    },

    {
      nombre: "Usuarios",
      ruta: "/usuarios",
    },
  ],

  SUPERVISOR: [
    { nombre: "Inicio", ruta: "/" },

    { nombre: "Producción", ruta: "/produccion" },

    { nombre: "Control de errores", ruta: "/carga" },

    { nombre: "Reportes", ruta: "/reportes" },

    {
      nombre: "Consulta SKU",
      ruta: "/consulta-sku",
    },
    {
      nombre: "Mapa de línea",
      ruta: "/mapa-linea",
    },
  ],

  CONTROLADOR: [
    {
      nombre: "Control de errores",
      ruta: "/carga",
    },

    {
      nombre: "Consulta SKU",
      ruta: "/consulta-sku",
    },
  ],

  CONSULTA: [
    {
      nombre: "Consulta SKU",
      ruta: "/consulta-sku",
    },

    {
      nombre: "Reportes",
      ruta: "/reportes",
    },
  ],
};