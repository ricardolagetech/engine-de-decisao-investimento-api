import { Router } from "express";
import { listarHistorico, excluir } from "../controllers/savedSimulation.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /simulacoes/historico:
 *   get:
 *     summary: Consultar histórico de simulações e comparações salvas
 *     tags: [Histórico]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de simulações individuais e comparações agrupadas por grupoComparacaoId
 *       401:
 *         description: Token não fornecido ou inválido
 */
router.get("/historico", authMiddleware, listarHistorico);

/**
 * @swagger
 * /simulacoes/{id}:
 *   delete:
 *     summary: Excluir uma simulação salva
 *     tags: [Histórico]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID da simulação a excluir
 *     responses:
 *       200:
 *         description: Simulação excluída com sucesso
 *       403:
 *         description: Sem permissão para excluir esta simulação
 *       404:
 *         description: Simulação não encontrada
 */
router.delete("/:id", authMiddleware, excluir);

export default router;
