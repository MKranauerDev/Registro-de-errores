-- CreateEnum
CREATE TYPE "ResultadoControl" AS ENUM ('FALTANTE', 'SOBRANTE', 'SIN_ERROR_BASE');

-- CreateTable
CREATE TABLE "Picker" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Picker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Controlador" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Controlador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sku" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relevamiento" (
    "id" SERIAL NOT NULL,
    "fechaCarga" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mesOperativo" TEXT NOT NULL,
    "remito" TEXT NOT NULL,
    "cbi" TEXT NOT NULL,
    "resultadoControl" "ResultadoControl" NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "observacion" TEXT,
    "estacionId" INTEGER NOT NULL,
    "pickerId" INTEGER NOT NULL,
    "skuId" INTEGER NOT NULL,
    "controladorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Relevamiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Picker_nombre_key" ON "Picker"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Estacion_nombre_key" ON "Estacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Controlador_nombre_key" ON "Controlador"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Sku_codigo_key" ON "Sku"("codigo");

-- AddForeignKey
ALTER TABLE "Relevamiento" ADD CONSTRAINT "Relevamiento_estacionId_fkey" FOREIGN KEY ("estacionId") REFERENCES "Estacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relevamiento" ADD CONSTRAINT "Relevamiento_pickerId_fkey" FOREIGN KEY ("pickerId") REFERENCES "Picker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relevamiento" ADD CONSTRAINT "Relevamiento_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "Sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relevamiento" ADD CONSTRAINT "Relevamiento_controladorId_fkey" FOREIGN KEY ("controladorId") REFERENCES "Controlador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
