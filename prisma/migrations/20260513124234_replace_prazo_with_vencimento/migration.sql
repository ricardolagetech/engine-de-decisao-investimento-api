/*
  Warnings:

  - You are about to drop the column `prazoMeses` on the `SimulacaoSalva` table. All the data in the column will be lost.
  - Added the required column `dataVencimento` to the `SimulacaoSalva` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SimulacaoSalva" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "tipoRemuneracao" TEXT NOT NULL,
    "valorInicial" REAL NOT NULL,
    "dataVencimento" DATETIME NOT NULL,
    "percentualCDI" REAL,
    "taxaAnual" REAL,
    "resultadoBruto" REAL NOT NULL,
    "ir" REAL NOT NULL,
    "resultadoLiquido" REAL NOT NULL,
    "grupoComparacaoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SimulacaoSalva_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SimulacaoSalva" ("createdAt", "id", "ir", "percentualCDI", "resultadoBruto", "resultadoLiquido", "taxaAnual", "tipo", "tipoRemuneracao", "userId", "valorInicial") SELECT "createdAt", "id", "ir", "percentualCDI", "resultadoBruto", "resultadoLiquido", "taxaAnual", "tipo", "tipoRemuneracao", "userId", "valorInicial" FROM "SimulacaoSalva";
DROP TABLE "SimulacaoSalva";
ALTER TABLE "new_SimulacaoSalva" RENAME TO "SimulacaoSalva";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
