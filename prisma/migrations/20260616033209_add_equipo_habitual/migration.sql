-- CreateTable
CREATE TABLE "EquipoHabitual" (
    "id" SERIAL NOT NULL,
    "estacionId" INTEGER NOT NULL,
    "pickerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipoHabitual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EquipoHabitual_estacionId_key" ON "EquipoHabitual"("estacionId");

-- AddForeignKey
ALTER TABLE "EquipoHabitual" ADD CONSTRAINT "EquipoHabitual_estacionId_fkey" FOREIGN KEY ("estacionId") REFERENCES "Estacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipoHabitual" ADD CONSTRAINT "EquipoHabitual_pickerId_fkey" FOREIGN KEY ("pickerId") REFERENCES "Picker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
