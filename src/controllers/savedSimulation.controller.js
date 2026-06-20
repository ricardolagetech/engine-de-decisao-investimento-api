import * as savedService from "../services/savedSimulation.service.js";

export async function listarHistorico(req, res, next) {
  try {
    const userId = req.usuario.id;
    const simulacoes = await savedService.listarHistorico(userId);
    res.json(simulacoes);
  } catch (err) {
    next(err);
  }
}

export async function excluir(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const userId = req.usuario.id;
    const resultado = await savedService.excluir({ id, userId });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}
