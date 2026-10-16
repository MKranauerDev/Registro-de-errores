# 📦 Sistema de Control de Pickeo y Producción

Aplicación web para la gestión operativa de líneas de pickeo, control de errores y seguimiento de productividad en tiempo real.

---

## 🚀 Funcionalidades principales

### 📊 Producción de línea

- Registro de jornadas operativas
- Gestión de bloques de tiempo:
  - Producción
  - Descanso
  - Mantenimiento
  - Sin órdenes
- Cálculo automático de:
  - Horas productivas
  - Horas hombre
  - Eficiencia de línea

### 👷 Gestión de pickers

- Asignación de operarios a estaciones
- Visualización de equipo activo en línea
- Eliminación dinámica de asignaciones

### 📦 Producción por transporte

- Registro de producción por canal:
  - OCA
  - Andreani
  - Urbano
  - CDS
- Soporte de:
  - Cantidad de paquetes
  - Cantidad de pallets
  - Ratio paquetes/pallet

### ⚠️ Control de errores de pickeo

- Registro de errores:
  - Faltantes
  - Sobrantes
  - Sin error (desvío de sistema)
- Trazabilidad por:
  - Picker
  - Estación
  - SKU
  - Controlador

---

## 🧠 Métricas operativas

El sistema calcula automáticamente:

- 📦 Total de paquetes
- 🧱 Total de pallets
- ⏱ Horas productivas
- 👥 Horas hombre
- ⚡ Eficiencia (paquetes / hora hombre)

Clasificación de eficiencia:

- 🔴 < 190 → Baja
- 🟡 191→220 Media
- 🟢 ≥ 221 → Alta

---

## 🧩 Arquitectura

- **Frontend:** Astro
- **Backend:** Astro API Routes
- **Base de datos:** PostgreSQL
- **ORM:** Prisma

---

## 🎨 UI / UX

- Layout con navegación lateral (Sidebar)
- Dashboard operativo con métricas en tiempo real
- Tablas optimizadas para lectura en planta
- Scroll inteligente para listas largas
- Diseño responsive

---

## ⚙️ Instalación

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo

npm install
npx prisma generate
npx prisma migrate dev

npm run dev
npx prisma studio
```

matias.kranauer@gmail.com admin12345
