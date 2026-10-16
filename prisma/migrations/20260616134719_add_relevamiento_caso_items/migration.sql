-- CreateTable
CREATE TABLE "RelevamientoCaso" (
    "id" SERIAL NOT NULL,
    "fechaCarga" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mesOperativo" TEXT NOT NULL,
    "remito" TEXT NOT NULL,
    "cbi" TEXT NOT NULL,
    "observacion" TEXT,
    "controladorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelevamientoCaso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelevamientoItem" (
    "id" SERIAL NOT NULL,
    "casoId" INTEGER NOT NULL,
    "skuId" INTEGER NOT NULL,
    "estacionId" INTEGER NOT NULL,
    "pickerId" INTEGER NOT NULL,
    "resultadoControl" "ResultadoControl" NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "posicionSkuAlMomento" TEXT,
    "estadoSkuAlMomento" "EstadoSkuLinea",
    "pickerAlMomento" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelevamientoItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RelevamientoCaso" ADD CONSTRAINT "RelevamientoCaso_controladorId_fkey" FOREIGN KEY ("controladorId") REFERENCES "Controlador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelevamientoItem" ADD CONSTRAINT "RelevamientoItem_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "RelevamientoCaso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelevamientoItem" ADD CONSTRAINT "RelevamientoItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "Sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelevamientoItem" ADD CONSTRAINT "RelevamientoItem_estacionId_fkey" FOREIGN KEY ("estacionId") REFERENCES "Estacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelevamientoItem" ADD CONSTRAINT "RelevamientoItem_pickerId_fkey" FOREIGN KEY ("pickerId") REFERENCES "Picker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
