import "dotenv/config";
import XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const filePath = "./2019 - Auditoria de Articulos.xlsx";

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  const normalized = String(value)
    .replace(",", ".")
    .trim();

  const number = Number(normalized);
  return Number.isNaN(number) ? null : number;
}

function toInt(value) {
  const number = toNumber(value);
  return number === null ? null : Math.trunc(number);
}

async function main() {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    range: 4,
    defval: null,
  });

  let insertados = 0;
  let omitidos = 0;

  for (const row of rows) {
    const codigo = row["imlitm"] ? String(row["imlitm"]).trim() : null;

    if (!codigo) {
      omitidos++;
      continue;
    }

    await prisma.sku.upsert({
      where: {
        codigo,
      },
      update: {
        descripcion: row["imdsc1"] ? String(row["imdsc1"]).trim() : null,
        // descripcionAlt: row["Descripción Alterna"]
        //   ? String(row["Descripción Alterna"]).trim()
        //   : null,
        width: toNumber(row["Widht"]),
        depth: toNumber(row["Depth"]),
        height: toNumber(row["Height"]),
        cubicaje: toNumber(row["Cubicaje"]),
        pesoBranch: toNumber(row["PESO_BRANCH"]),
        piezasCaja: toInt(row["Piezas en Caja"]),
        activo: true,
      },
      create: {
        codigo,
        descripcion: row["imdsc1"] ? String(row["imdsc1"]).trim() : null,
        // descripcionAlt: row["Descripción Alterna"]
        //   ? String(row["Descripción Alterna"]).trim()
        //   : null,
        width: toNumber(row["Widht"]),
        depth: toNumber(row["Depth"]),
        height: toNumber(row["Height"]),
        cubicaje: toNumber(row["Cubicaje"]),
        pesoBranch: toNumber(row["PESO_BRANCH"]),
        piezasCaja: toInt(row["Piezas en Caja"]),
        activo: true,
      },
    });

    insertados++;
  }

  console.log(`✅ Carga finalizada`);
  console.log(`📦 Registros procesados: ${insertados}`);
  console.log(`⚠️ Filas omitidas: ${omitidos}`);
}

main()
  .catch((error) => {
    console.error("❌ Error cargando SKUs:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });