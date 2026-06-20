import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Engine de Decisão de Investimento em RF",
      version: "1.0.0",
      description: "API para simulação e comparação de investimentos em Renda Fixa (CDB, LCI, LCA)",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        SimulacaoInput: {
          type: "object",
          required: ["valorInicial", "dataVencimento", "tipoRemuneracao"],
          properties: {
            valorInicial: { type: "number", example: 10000 },
            dataVencimento: { type: "string", format: "date", example: "2027-09-30", description: "Data de vencimento no formato YYYY-MM-DD" },
            tipoRemuneracao: { type: "string", enum: ["POS_FIXADO", "PREFIXADO"], example: "POS_FIXADO" },
            percentualCDI: { type: "number", example: 110, description: "Obrigatório se POS_FIXADO. Ex: 110 = 110% do CDI" },
            taxaAnual: { type: "number", example: 12.5, description: "Obrigatório se PREFIXADO. Ex: 12.5 = 12,5% a.a." },
            cdi: { type: "number", example: 10.75, description: "Taxa CDI em % a.a. Obrigatório se POS_FIXADO. Ex: 10.75 = 10,75% a.a." },
          },
        },
        SimulacaoResultado: {
          type: "object",
          properties: {
            tipo: { type: "string", example: "CDB" },
            tipoRemuneracao: { type: "string", example: "POS_FIXADO" },
            valorInicial: { type: "number", example: 10000 },
            dataVencimento: { type: "string", format: "date", example: "2027-09-30" },
            prazoEmDias: { type: "integer", example: 504, description: "Dias corridos até o vencimento" },
            percentualCDI: { type: "number", example: 110 },
            taxaAnual: { type: "number", example: null },
            resultadoBruto: { type: "number", example: 11523.45 },
            ir: { type: "number", example: 230.35 },
            resultadoLiquido: { type: "number", example: 11293.10 },
            aliquotaIR: { type: "number", example: 17.5, description: "Alíquota de IR aplicada (%); 0 para LCI e LCA" },
            percentualGanhoLiquido: { type: "number", example: 12.93, description: "Ganho total líquido no período (%)" },
            percentualGanhoLiquidoAnual: { type: "number", example: 9.14, description: "Ganho líquido anualizado — CAGR após IR (%) — use este para comparar investimentos com prazos diferentes" },
          },
        },
        ItemComparacao: {
          type: "object",
          required: ["tipo", "valorInicial", "dataVencimento", "tipoRemuneracao"],
          properties: {
            tipo: { type: "string", enum: ["CDB", "LCI", "LCA"], example: "CDB" },
            valorInicial: { type: "number", example: 10000 },
            dataVencimento: { type: "string", format: "date", example: "2027-09-30" },
            tipoRemuneracao: { type: "string", enum: ["POS_FIXADO", "PREFIXADO"], example: "POS_FIXADO" },
            percentualCDI: { type: "number", example: 110 },
            taxaAnual: { type: "number", example: 12.5 },
          },
        },
        ComparacaoInput: {
          type: "object",
          required: ["investimentos"],
          properties: {
            nome: { type: "string", example: "Comparação Julho 2025", description: "Opcional. Nome/label para identificar esta comparação no histórico." },
            investimentos: {
              type: "array",
              minItems: 2,
              description: "Mínimo 2 itens. O CDI usado no cálculo vem do banco (configure via POST /cdi antes de comparar).",
              items: { $ref: "#/components/schemas/ItemComparacao" },
              example: [
                { tipo: "CDB", valorInicial: 10000, dataVencimento: "2027-09-30", tipoRemuneracao: "POS_FIXADO", percentualCDI: 110 },
                { tipo: "LCI", valorInicial: 10000, dataVencimento: "2027-03-30", tipoRemuneracao: "PREFIXADO", taxaAnual: 12.5 },
                { tipo: "LCA", valorInicial: 10000, dataVencimento: "2028-01-15", tipoRemuneracao: "POS_FIXADO", percentualCDI: 105 },
              ],
            },
          },
        },
        ComparacaoResultado: {
          type: "object",
          properties: {
            grupoComparacaoId: { type: "string", example: "d19ded3c-3873-431a-9e94-d503bade9611", description: "Presente quando 2+ investimentos foram salvos no histórico" },
            ranking: {
              type: "array",
              items: {
                allOf: [
                  { $ref: "#/components/schemas/SimulacaoResultado" },
                  { type: "object", properties: { posicao: { type: "integer", example: 1 } } },
                ],
              },
            },
          },
        },
        ErroResposta: {
          type: "object",
          properties: {
            erro: { type: "string", example: "Mensagem de erro" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

export default swaggerJsdoc(options);
