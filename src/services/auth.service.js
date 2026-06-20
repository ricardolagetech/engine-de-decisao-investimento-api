import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export async function register({ nome, email, senha }) {
  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) {
    const err = new Error("E-mail já cadastrado");
    err.status = 409;
    throw err;
  }
  if (senha.length < 8) {
    const err = new Error("A senha deve ter no mínimo 8 caracteres");
    err.status = 400;
    throw err;
  }
  const hash = await bcrypt.hash(senha, 10);
  const user = await prisma.user.create({
    data: { nome, email, senha: hash },
    select: { id: true, nome: true, email: true, createdAt: true },
  });
  return user;
}

export async function login({ email, senha }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error("Credenciais inválidas");
    err.status = 401;
    throw err;
  }
  const senhaValida = await bcrypt.compare(senha, user.senha);
  if (!senhaValida) {
    const err = new Error("Credenciais inválidas");
    err.status = 401;
    throw err;
  }
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
  return { token, usuario: { id: user.id, nome: user.nome, email: user.email } };
}
