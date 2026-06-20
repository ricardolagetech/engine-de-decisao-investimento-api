-- AlterTable
ALTER TABLE "SimulacaoSalva" ADD COLUMN "cdiValor" REAL;
ALTER TABLE "SimulacaoSalva" ADD COLUMN "nomeComparacao" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TaxaCDI" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "valor" REAL NOT NULL,
    "dataVigencia" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaxaCDI_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TaxaCDI" ("dataVigencia", "id", "valor") SELECT "dataVigencia", "id", "valor" FROM "TaxaCDI";
DROP TABLE "TaxaCDI";
ALTER TABLE "new_TaxaCDI" RENAME TO "TaxaCDI";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
