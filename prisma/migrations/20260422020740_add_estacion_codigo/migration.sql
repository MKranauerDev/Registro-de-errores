/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Estacion` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Estacion` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Estacion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `Estacion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `Estacion` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Estacion_nombre_key";

-- AlterTable
ALTER TABLE "Estacion" DROP COLUMN "createdAt",
DROP COLUMN "nombre",
DROP COLUMN "updatedAt",
ADD COLUMN     "codigo" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Estacion_codigo_key" ON "Estacion"("codigo");
