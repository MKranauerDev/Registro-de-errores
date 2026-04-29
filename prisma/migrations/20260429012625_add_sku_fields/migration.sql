/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Picker` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Picker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Picker" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Sku" ADD COLUMN     "cubicaje" DOUBLE PRECISION,
ADD COLUMN     "depth" DOUBLE PRECISION,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "pesoBranch" DOUBLE PRECISION,
ADD COLUMN     "piezasCaja" INTEGER,
ADD COLUMN     "width" DOUBLE PRECISION;
