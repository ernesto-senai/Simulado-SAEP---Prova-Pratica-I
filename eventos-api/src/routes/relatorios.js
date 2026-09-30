// Rotas que consultam as 3 VIEWS criadas no seu SQL
const { Router } = require('express');
const prisma = require('../prisma');

const router = Router();

// COUNT() no MySQL volta como BIGINT, que o JSON não consegue converter.
// Esta função troca esses valores por números comuns.
function converterBigInt(linhas) {
  return linhas.map((linha) =>
    Object.fromEntries(
      Object.entries(linha).map(([chave, valor]) => [
        chave,
        typeof valor === 'bigint' ? Number(valor) : valor,
      ])
    )
  );
}

// GET /relatorios/eventos -> vw_eventos_palestrantes
router.get('/eventos', async (req, res) => {
  const linhas = await prisma.$queryRaw`
    SELECT * FROM vw_eventos_palestrantes ORDER BY id_evento`;
  res.json(converterBigInt(linhas));
});

// GET /relatorios/palestrantes -> vw_palestrantes_eventos
router.get('/palestrantes', async (req, res) => {
  const linhas = await prisma.$queryRaw`
    SELECT * FROM vw_palestrantes_eventos ORDER BY nome_palestrante`;
  res.json(converterBigInt(linhas));
});

// GET /relatorios/vinculos -> vw_evento_palestrante_detalhe
router.get('/vinculos', async (req, res) => {
  const linhas = await prisma.$queryRaw`
    SELECT * FROM vw_evento_palestrante_detalhe ORDER BY id_evento, nome_palestrante`;
  res.json(converterBigInt(linhas));
});

module.exports = router;
