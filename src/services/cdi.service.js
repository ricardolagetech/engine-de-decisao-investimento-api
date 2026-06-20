import prisma from "../lib/prisma.js";

export async function configurar({ valor, userId }) {
  return prisma.taxaCDI.create({ data: { valor, userId } });
}

export async function obterAtual(userId) {
  if (userId) {
    const taxa = await prisma.taxaCDI.findFirst({
      where: { userId },
      orderBy: { dataVigencia: "desc" },
    });
    if (taxa) return taxa;
  }
  const err = new Error("Nenhuma taxa CDI configurada. Configure via POST /cdi.");
  err.status = 404;
  throw err;
}
