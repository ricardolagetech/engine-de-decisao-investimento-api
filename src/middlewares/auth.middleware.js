import jwt from "jsonwebtoken";
import { tokenBlacklist } from "../lib/tokenBlacklist.js";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }
  const token = authHeader.split(" ")[1];
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ erro: "Token inválido ou expirado" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch {
    res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}

export function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (!tokenBlacklist.has(token)) {
      try { req.usuario = jwt.verify(token, process.env.JWT_SECRET); } catch {}
    }
  }
  next();
}
