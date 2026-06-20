import * as simulationService from "../services/simulation.service.js";
import * as savedService from "../services/savedSimulation.service.js";

export async function simularCDB(req, res, next) {
  try {
    const resultado = simulationService.simularCDB(req.body);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function simularLciLca(req, res, next) {
  try {
    const resultado = simulationService.simularLciLca(req.body);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function comparar(req, res, next) {
  try {
    const { investimentos, nome } = req.body;
    const userId = req.usuario.id;
    const { ranking, cdiValor } = await simulationService.comparar({ investimentos, userId });
    const saved = await savedService.salvarComparacao({
      ranking,
      userId,
      cdiValor,
      nomeComparacao: nome ?? null,
    });
    res.json({ grupoComparacaoId: saved.grupoComparacaoId, ranking });
  } catch (err) {
    next(err);
  }
}
