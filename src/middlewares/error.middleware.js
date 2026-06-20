export function errorMiddleware(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor";
  res.status(status).json({ erro: message });
}
