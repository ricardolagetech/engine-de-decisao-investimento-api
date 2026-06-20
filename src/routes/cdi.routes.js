import { Router } from "express";
import { configurar, obterAtual } from "../controllers/cdi.controller.js";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /cdi:
 *   post:
 *     summary: Configurar taxa CDI
 *     tags: [CDI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [valor]
 *             properties:
 *               valor: { type: number, example: 10.75, description: "Taxa CDI em % ao ano" }
 *     responses:
 *       201:
 *         description: Taxa CDI configurada com sucesso
 *       400:
 *         description: Valor inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErroResposta' }
 */
router.post("/", authMiddleware, configurar);

/**
 * @swagger
 * /cdi:
 *   get:
 *     summary: Consultar taxa CDI atual
 *     tags: [CDI]
 *     responses:
 *       200:
 *         description: Taxa CDI vigente
 *       404:
 *         description: Nenhuma taxa CDI cadastrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErroResposta' }
 */
router.get("/", optionalAuthMiddleware, obterAtual);

export default router;
