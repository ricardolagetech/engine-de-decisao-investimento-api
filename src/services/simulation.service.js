import prisma from "../lib/prisma.js";

const ALIQUOTAS_IR = [
  { maxDias: 180, aliquota: 0.225 },
  { maxDias: 360, aliquota: 0.20 },
  { maxDias: 720, aliquota: 0.175 },
  { maxDias: Infinity, aliquota: 0.15 },
];

function calcularDias(dataVencimento) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dateStr = String(dataVencimento).split("T")[0];
  const venc = new Date(dateStr + "T00:00:00");
  return Math.round((venc - hoje) / (1000 * 60 * 60 * 24));
}

function calcularAliquotaIR(dias) {
  return ALIQUOTAS_IR.find((f) => dias <= f.maxDias).aliquota;
}

function ganhoAnual(resultadoLiquido, valorInicial, dias) {
  return +(((Math.pow(resultadoLiquido / valorInicial, 365 / dias) - 1) * 100).toFixed(2));
}

function calcularRendimentoBruto({ valorInicial, dias, tipoRemuneracao, percentualCDI, taxaAnual, cdi }) {
  const taxaEfetiva = tipoRemuneracao === "POS_FIXADO"
    ? (cdi * (percentualCDI / 100)) / 100
    : taxaAnual / 100;
  return valorInicial * Math.pow(1 + taxaEfetiva, dias / 365);
}

function calcularCDB({ valorInicial, dataVencimento, tipoRemuneracao, percentualCDI, taxaAnual, cdi }) {
  const dias = calcularDias(dataVencimento);
  const resultadoBruto = calcularRendimentoBruto({ valorInicial, dias, tipoRemuneracao, percentualCDI, taxaAnual, cdi });
  const rendimento = resultadoBruto - valorInicial;
  const aliquota = calcularAliquotaIR(dias);
  const ir = rendimento * aliquota;
  const resultadoLiquido = resultadoBruto - ir;
  return {
    tipo: "CDB",
    tipoRemuneracao,
    valorInicial,
    dataVencimento,
    prazoEmDias: dias,
    percentualCDI: tipoRemuneracao === "POS_FIXADO" ? percentualCDI : null,
    taxaAnual: tipoRemuneracao === "PREFIXADO" ? taxaAnual : null,
    resultadoBruto: +resultadoBruto.toFixed(2),
    ir: +ir.toFixed(2),
    resultadoLiquido: +resultadoLiquido.toFixed(2),
    aliquotaIR: +(aliquota * 100).toFixed(1),
    percentualGanhoLiquido: +((resultadoLiquido - valorInicial) / valorInicial * 100).toFixed(2),
    percentualGanhoLiquidoAnual: ganhoAnual(resultadoLiquido, valorInicial, dias),
  };
}

function calcularLCI({ valorInicial, dataVencimento, tipoRemuneracao, percentualCDI, taxaAnual, cdi }) {
  const dias = calcularDias(dataVencimento);
  const resultadoBruto = calcularRendimentoBruto({ valorInicial, dias, tipoRemuneracao, percentualCDI, taxaAnual, cdi });
  return {
    tipo: "LCI",
    tipoRemuneracao,
    valorInicial,
    dataVencimento,
    prazoEmDias: dias,
    percentualCDI: tipoRemuneracao === "POS_FIXADO" ? percentualCDI : null,
    taxaAnual: tipoRemuneracao === "PREFIXADO" ? taxaAnual : null,
    resultadoBruto: +resultadoBruto.toFixed(2),
    ir: 0,
    resultadoLiquido: +resultadoBruto.toFixed(2),
    aliquotaIR: 0,
    percentualGanhoLiquido: +((resultadoBruto - valorInicial) / valorInicial * 100).toFixed(2),
    percentualGanhoLiquidoAnual: ganhoAnual(resultadoBruto, valorInicial, dias),
  };
}

function calcularLCA({ valorInicial, dataVencimento, tipoRemuneracao, percentualCDI, taxaAnual, cdi }) {
  const dias = calcularDias(dataVencimento);
  const resultadoBruto = calcularRendimentoBruto({ valorInicial, dias, tipoRemuneracao, percentualCDI, taxaAnual, cdi });
  return {
    tipo: "LCA",
    tipoRemuneracao,
    valorInicial,
    dataVencimento,
    prazoEmDias: dias,
    percentualCDI: tipoRemuneracao === "POS_FIXADO" ? percentualCDI : null,
    taxaAnual: tipoRemuneracao === "PREFIXADO" ? taxaAnual : null,
    resultadoBruto: +resultadoBruto.toFixed(2),
    ir: 0,
    resultadoLiquido: +resultadoBruto.toFixed(2),
    aliquotaIR: 0,
    percentualGanhoLiquido: +((resultadoBruto - valorInicial) / valorInicial * 100).toFixed(2),
    percentualGanhoLiquidoAnual: ganhoAnual(resultadoBruto, valorInicial, dias),
  };
}

const calculadores = { CDB: calcularCDB, LCI: calcularLCI, LCA: calcularLCA };

async function obterCDI(userId) {
  const userCDI = await prisma.taxaCDI.findFirst({
    where: { userId },
    orderBy: { dataVigencia: "desc" },
  });
  if (userCDI) return userCDI.valor;
  const err = new Error("Configure sua taxa CDI via POST /cdi antes de comparar investimentos.");
  err.status = 422;
  throw err;
}

function validarInput({ valorInicial, dataVencimento, tipoRemuneracao, percentualCDI, taxaAnual, cdi }, { requireCdi = false } = {}) {
  if (!valorInicial || !dataVencimento || !tipoRemuneracao) {
    const err = new Error("valorInicial, dataVencimento e tipoRemuneracao são obrigatórios");
    err.status = 400;
    throw err;
  }
  const dateStr = String(dataVencimento).split("T")[0];
  const venc = new Date(dateStr + "T00:00:00");
  if (isNaN(venc.getTime())) {
    const err = new Error("dataVencimento inválida. Use o formato YYYY-MM-DD");
    err.status = 400;
    throw err;
  }
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (venc <= hoje) {
    const err = new Error("dataVencimento deve ser uma data futura");
    err.status = 400;
    throw err;
  }
  if (!["POS_FIXADO", "PREFIXADO"].includes(tipoRemuneracao)) {
    const err = new Error("tipoRemuneracao deve ser POS_FIXADO ou PREFIXADO");
    err.status = 400;
    throw err;
  }
  if (tipoRemuneracao === "POS_FIXADO" && !percentualCDI) {
    const err = new Error("percentualCDI é obrigatório para tipoRemuneracao POS_FIXADO");
    err.status = 400;
    throw err;
  }
  if (tipoRemuneracao === "PREFIXADO" && !taxaAnual) {
    const err = new Error("taxaAnual é obrigatória para tipoRemuneracao PREFIXADO");
    err.status = 400;
    throw err;
  }
  if (requireCdi && tipoRemuneracao === "POS_FIXADO" && (cdi === undefined || cdi === null)) {
    const err = new Error('cdi é obrigatório para tipoRemuneracao POS_FIXADO (ex: { "cdi": 10.75 })');
    err.status = 400;
    throw err;
  }
}

export function simularCDB(params) {
  validarInput(params, { requireCdi: true });
  return calcularCDB(params);
}

export function simularLciLca(params) {
  const tiposValidos = ["LCI", "LCA"];
  if (!tiposValidos.includes(params.tipo)) {
    const err = new Error(`tipo inválido: "${params.tipo}". Use LCI ou LCA`);
    err.status = 400;
    throw err;
  }
  validarInput(params, { requireCdi: true });
  return calculadores[params.tipo](params);
}

export async function comparar({ investimentos, userId }) {
  if (!Array.isArray(investimentos) || investimentos.length < 2) {
    const err = new Error("investimentos deve ser um array com pelo menos 2 itens");
    err.status = 400;
    throw err;
  }
  const tiposValidos = ["CDB", "LCI", "LCA"];
  for (const inv of investimentos) {
    if (!tiposValidos.includes(inv.tipo)) {
      const err = new Error(`tipo inválido: "${inv.tipo}". Use CDB, LCI ou LCA`);
      err.status = 400;
      throw err;
    }
    validarInput(inv);
  }

  const cdiValor = await obterCDI(userId);
  const resultados = investimentos.map((inv) => calculadores[inv.tipo]({ ...inv, cdi: cdiValor }));
  resultados.sort((a, b) => b.percentualGanhoLiquidoAnual - a.percentualGanhoLiquidoAnual);

  const melhorCAGR = resultados[0].percentualGanhoLiquidoAnual;
  let ranking = resultados.map((r, i) => ({
    posicao: i + 1,
    empatado: r.percentualGanhoLiquidoAnual === melhorCAGR,
    ...r,
  }));

  if (ranking.filter((r) => r.empatado).length === 1) {
    ranking[0] = {
      ...ranking[0],
      diferencialReais: +(ranking[0].resultadoLiquido - ranking[1].resultadoLiquido).toFixed(2),
      diferencialPercentualAnual: +(ranking[0].percentualGanhoLiquidoAnual - ranking[1].percentualGanhoLiquidoAnual).toFixed(2),
    };
  }

  return { ranking, cdiValor };
}
