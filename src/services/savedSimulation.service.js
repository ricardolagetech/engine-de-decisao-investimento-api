import { randomUUID } from "crypto";
import prisma from "../lib/prisma.js";

function enriquecerSimulacao(sim) {
  const prazoEmDias = Math.round(
    (new Date(sim.dataVencimento) - new Date(sim.createdAt)) / (1000 * 60 * 60 * 24)
  );
  const percentualGanhoLiquido = +((sim.resultadoLiquido - sim.valorInicial) / sim.valorInicial * 100).toFixed(2);
  const percentualGanhoLiquidoAnual = +(((Math.pow(sim.resultadoLiquido / sim.valorInicial, 365 / prazoEmDias) - 1) * 100).toFixed(2));
  return { ...sim, prazoEmDias, percentualGanhoLiquido, percentualGanhoLiquidoAnual };
}

export async function salvarComparacao({ ranking, userId, cdiValor, nomeComparacao }) {
  const grupoComparacaoId = randomUUID();
  await Promise.all(
    ranking.map(({
      posicao: _posicao,
      percentualGanhoLiquido: _pgl,
      percentualGanhoLiquidoAnual: _pgla,
      empatado: _empatado,
      diferencialReais: _dr,
      diferencialPercentualAnual: _dpa,
      prazoEmDias: _prazo,
      ...resultado
    }) =>
      prisma.simulacaoSalva.create({
        data: {
          userId,
          tipo: resultado.tipo,
          tipoRemuneracao: resultado.tipoRemuneracao,
          valorInicial: resultado.valorInicial,
          dataVencimento: new Date(String(resultado.dataVencimento).split("T")[0] + "T00:00:00"),
          percentualCDI: resultado.percentualCDI ?? null,
          taxaAnual: resultado.taxaAnual ?? null,
          resultadoBruto: resultado.resultadoBruto,
          ir: resultado.ir,
          resultadoLiquido: resultado.resultadoLiquido,
          aliquotaIR: resultado.aliquotaIR,
          grupoComparacaoId,
          cdiValor: cdiValor ?? null,
          nomeComparacao: nomeComparacao ?? null,
        },
      })
    )
  );
  return { grupoComparacaoId, ranking };
}

export async function listarHistorico(userId) {
  const simulacoes = await prisma.simulacaoSalva.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const gruposVistos = new Map();
  const historico = [];
  let melhorGeral = null;

  function atualizarMelhorGeral(sim) {
    if (!melhorGeral || sim.percentualGanhoLiquidoAnual > melhorGeral.percentualGanhoLiquidoAnual) {
      melhorGeral = sim;
    }
  }

  for (const sim of simulacoes) {
    const enriquecida = enriquecerSimulacao(sim);
    atualizarMelhorGeral(enriquecida);

    if (!sim.grupoComparacaoId) {
      historico.push(enriquecida);
    } else {
      if (!gruposVistos.has(sim.grupoComparacaoId)) {
        const grupo = {
          grupoComparacaoId: sim.grupoComparacaoId,
          nomeComparacao: sim.nomeComparacao ?? null,
          cdiValor: sim.cdiValor ?? null,
          createdAt: sim.createdAt,
          melhorDoGrupo: enriquecida,
          investimentos: [enriquecida],
        };
        gruposVistos.set(sim.grupoComparacaoId, grupo);
        historico.push(grupo);
      } else {
        const grupo = gruposVistos.get(sim.grupoComparacaoId);
        grupo.investimentos.push(enriquecida);
        if (enriquecida.percentualGanhoLiquidoAnual > grupo.melhorDoGrupo.percentualGanhoLiquidoAnual) {
          grupo.melhorDoGrupo = enriquecida;
        }
      }
    }
  }

  return { melhorGeral, historico };
}

export async function excluir({ id, userId }) {
  const simulacao = await prisma.simulacaoSalva.findUnique({ where: { id } });
  if (!simulacao) {
    const err = new Error("Simulação não encontrada");
    err.status = 404;
    throw err;
  }
  if (simulacao.userId !== userId) {
    const err = new Error("Sem permissão para excluir esta simulação");
    err.status = 403;
    throw err;
  }
  await prisma.simulacaoSalva.delete({ where: { id } });
  return { mensagem: "Simulação excluída com sucesso" };
}
