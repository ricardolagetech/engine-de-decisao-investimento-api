import * as cdiService from "../services/cdi.service.js";

export async function configurar(req, res, next) {
  try {
    const { valor } = req.body;
    if (valor === undefined || valor === null) {
      return res.status(400).json({ erro: "valor é obrigatório" });
    }
    if (typeof valor !== "number" || valor <= 0) {
      return res.status(400).json({ erro: "valor deve ser um número positivo (ex: 10.75)" });
    }
    const taxa = await cdiService.configurar({ valor, userId: req.usuario.id });
    res.status(201).json(taxa);
  } catch (err) {
    next(err);
  }
}

export async function obterAtual(req, res, next) {
  try {
    const taxa = await cdiService.obterAtual(req.usuario?.id);
    res.json(taxa);
  } catch (err) {
    next(err);
  }
}
