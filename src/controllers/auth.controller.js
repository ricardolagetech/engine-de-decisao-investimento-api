import * as authService from "../services/auth.service.js";
import { tokenBlacklist } from "../lib/tokenBlacklist.js";

export async function register(req, res, next) {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "nome, email e senha são obrigatórios" });
    }
    const usuario = await authService.register({ nome, email, senha });
    res.status(201).json(usuario);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: "email e senha são obrigatórios" });
    }
    const resultado = await authService.login({ email, senha });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  tokenBlacklist.add(token);
  res.json({ mensagem: "Logout realizado com sucesso" });
}
