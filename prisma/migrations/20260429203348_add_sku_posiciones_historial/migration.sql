-- CreateEnum
CREATE TYPE "EstadoSkuLinea" AS ENUM ('EN_LINEA', 'FUERA_DE_LINEA');

-- AlterTable
ALTER TABLE "Sku" ADD COLUMN     "imagenUrl" TEXT;

-- CreateTable
CREATE TABLE "SkuPosicionHistorial" (
    "id" SERIAL NOT NULL,
    "skuId" INTEGER NOT NULL,
    "posicion" TEXT,
    "estado" "EstadoSkuLinea" NOT NULL DEFAULT 'EN_LINEA',
    "fechaDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHasta" TIMESTAMP(3),
    "esActual" BOOLEAN NOT NULL DEFAULT true,
    "motivoCambio" TEXT,
    "usuarioCambio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkuPosicionHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkuPosicionHistorial_skuId_esActual_idx" ON "SkuPosicionHistorial"("skuId", "esActual");

-- CreateIndex
CREATE INDEX "SkuPosicionHistorial_estado_idx" ON "SkuPosicionHistorial"("estado");

-- AddForeignKey
ALTER TABLE "SkuPosicionHistorial" ADD CONSTRAINT "SkuPosicionHistorial_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "Sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
