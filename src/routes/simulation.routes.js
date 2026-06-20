import { Router } from "express";
import { simularCDB, simularLciLca, comparar } from "../controllers/simulation.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /simulacoes/cdb:
 *   post:
 *     summary: Simular investimento em CDB (sem autenticação, não salva no histórico)
 *     tags: [Simulações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SimulacaoInput' }
 *     responses:
 *       200:
 *         description: Resultado da simulação CDB com IR regressivo
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SimulacaoResultado' }
 *       400:
 *         description: Parâmetros inválidos (inclui cdi ausente quando POS_FIXADO)
 */
router.post("/cdb", simularCDB);

/**
 * @swagger
 * /simulacoes/lci-lca:
 *   post:
 *     summary: Simular investimento em LCI ou LCA (sem autenticação, não salva no histórico)
 *     tags: [Simulações]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/SimulacaoInput'
 *               - type: object
 *                 required: [tipo]
 *                 properties:
 *                   tipo:
 *                     type: string
 *                     enum: [LCI, LCA]
 *                     example: LCI
 *     responses:
 *       200:
 *         description: Resultado da simulação LCI ou LCA (isento de IR)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SimulacaoResultado' }
 *       400:
 *         description: Parâmetros inválidos (inclui cdi ausente quando POS_FIXADO)
 */
router.post("/lci-lca", simularLciLca);

/**
 * @swagger
 * /simulacoes/comparar:
 *   post:
 *     summary: Comparar investimentos (mínimo 2 itens; calcula e salva no histórico automaticamente)
 *     tags: [Simulações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ComparacaoInput' }
 *     responses:
 *       200:
 *         description: Ranking do melhor ao pior (1 item retorna ranking sem grupoComparacaoId)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ComparacaoResultado' }
 *       401:
 *         description: Token não fornecido ou inválido
 */
router.post("/comparar", authMiddleware, comparar);

export default router;
