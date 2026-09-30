// Conexão única com o banco, usada por todas as rotas
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
