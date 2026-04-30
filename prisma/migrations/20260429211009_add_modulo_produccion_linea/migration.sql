-- CreateEnum
CREATE TYPE "TipoBloqueLinea" AS ENUM ('PRODUCCION', 'DESCANSO', 'MANTENIMIENTO', 'SIN_ORDENES', 'PARADA_OPERATIVA');

-- CreateEnum
CREATE TYPE "Transporte" AS ENUM ('OCA', 'URBANO', 'ANDREANI', 'CDS');

-- AlterTable
ALTER TABLE "Relevamiento" ADD COLUMN     "controladorAlMomento" TEXT,
ADD COLUMN     "estadoSkuAlMomento" "EstadoSkuLinea",
ADD COLUMN     "pickerAlMomento" TEXT,
ADD COLUMN     "posicionSkuAlMomento" TEXT;

-- CreateTable
CREATE TABLE "EstacionPickerHistorial" (
    "id" SERIAL NOT NULL,
    "estacionId" INTEGER NOT NULL,
    "pickerId" INTEGER NOT NULL,
    "fechaDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHasta" TIMESTAMP(3),
    "esActual" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstacionPickerHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JornadaLinea" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "mesOperativo" TEXT NOT NULL,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JornadaLinea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloqueLinea" (
    "id" SERIAL NOT NULL,
    "jornadaId" INTEGER NOT NULL,
    "tipo" "TipoBloqueLinea" NOT NULL,
    "horaInicio" TIMESTAMP(3) NOT NULL,
    "horaFin" TIMESTAMP(3),
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloqueLinea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickerJornada" (
    "id" SERIAL NOT NULL,
    "jornadaId" INTEGER NOT NULL,
    "pickerId" INTEGER NOT NULL,
    "estacionId" INTEGER NOT NULL,
    "horaDesde" TIMESTAMP(3),
    "horaHasta" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickerJornada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProduccionTransporte" (
    "id" SERIAL NOT NULL,
    "jornadaId" INTEGER NOT NULL,
    "transporte" "Transporte" NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProduccionTransporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EstacionPickerHistorial_estacionId_esActual_idx" ON "EstacionPickerHistorial"("estacionId", "esActual");

-- CreateIndex
CREATE UNIQUE INDEX "ProduccionTransporte_jornadaId_transporte_key" ON "ProduccionTransporte"("jornadaId", "transporte");

-- AddForeignKey
ALTER TABLE "EstacionPickerHistorial" ADD CONSTRAINT "EstacionPickerHistorial_estacionId_fkey" FOREIGN KEY ("estacionId") REFERENCES "Estacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstacionPickerHistorial" ADD CONSTRAINT "EstacionPickerHistorial_pickerId_fkey" FOREIGN KEY ("pickerId") REFERENCES "Picker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloqueLinea" ADD CONSTRAINT "BloqueLinea_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "JornadaLinea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickerJornada" ADD CONSTRAINT "PickerJornada_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "JornadaLinea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickerJornada" ADD CONSTRAINT "PickerJornada_pickerId_fkey" FOREIGN KEY ("pickerId") REFERENCES "Picker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickerJornada" ADD CONSTRAINT "PickerJornada_estacionId_fkey" FOREIGN KEY ("estacionId") REFERENCES "Estacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduccionTransporte" ADD CONSTRAINT "ProduccionTransporte_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "JornadaLinea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
