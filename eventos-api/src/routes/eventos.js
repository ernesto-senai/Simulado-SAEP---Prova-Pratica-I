// Rotas de EVENTOS: cadastro, listagem, alteração, exclusão
// e vínculo de palestrantes (tabela evento_palestrante)
const { Router } = require('express');
const prisma = require('../prisma');
const { validarCampos, lerId } = require('../validacao');

const router = Router();

// Tamanho máximo igual ao das colunas do SQL (descricao é TEXT)
const REGRAS_EVENTO = { nome: 150, descricao: null, local: 200 };

// Faz o Prisma trazer os palestrantes junto com o evento
const incluirPalestrantes = {
  evento_palestrante: {
    include: { palestrante: true },
    orderBy: { palestrante: { nome: 'asc' } },
  },
};

// Deixa a resposta mais limpa: "palestrantes" vira uma lista simples
function formatarEvento(evento) {
  return {
    id_evento: evento.id_evento,
    nome: evento.nome,
    descricao: evento.descricao,
    local: evento.local,
    palestrantes: evento.evento_palestrante.map((vinculo) => vinculo.palestrante),
  };
}

async function buscarEvento(id_evento) {
  const evento = await prisma.evento.findUnique({
    where: { id_evento },
    include: incluirPalestrantes,
  });
  return evento ? formatarEvento(evento) : null;
}

function dadosDoEvento(body) {
  return {
    nome: body.nome.trim(),
    descricao: body.descricao.trim(),
    local: body.local.trim(),
  };
}

// GET /eventos -> lista os eventos com seus palestrantes
router.get('/', async (req, res) => {
  const eventos = await prisma.evento.findMany({
    include: incluirPalestrantes,
    orderBy: { id_evento: 'asc' },
  });
  res.json(eventos.map(formatarEvento));
});

// GET /eventos/:id -> seleciona um evento
router.get('/:id', async (req, res) => {
  const id_evento = lerId(req.params.id);
  if (!id_evento) return res.status(400).json({ erro: 'ID do evento inválido.' });

  const evento = await buscarEvento(id_evento);
  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado.' });

  res.json(evento);
});

// POST /eventos -> cadastra um evento
router.post('/', async (req, res) => {
  const erro = validarCampos(req.body, REGRAS_EVENTO);
  if (erro) return res.status(400).json({ erro });

  const novo = await prisma.evento.create({ data: dadosDoEvento(req.body) });
  res.status(201).json(await buscarEvento(novo.id_evento));
});

// PUT /eventos/:id -> altera as informações do evento
router.put('/:id', async (req, res) => {
  const id_evento = lerId(req.params.id);
  if (!id_evento) return res.status(400).json({ erro: 'ID do evento inválido.' });

  const erro = validarCampos(req.body, REGRAS_EVENTO);
  if (erro) return res.status(400).json({ erro });

  await prisma.evento.update({ where: { id_evento }, data: dadosDoEvento(req.body) });
  res.json(await buscarEvento(id_evento));
});

// DELETE /eventos/:id -> exclui o evento (os vínculos saem junto: ON DELETE CASCADE)
router.delete('/:id', async (req, res) => {
  const id_evento = lerId(req.params.id);
  if (!id_evento) return res.status(400).json({ erro: 'ID do evento inválido.' });

  await prisma.evento.delete({ where: { id_evento } });
  res.status(204).end();
});

// POST /eventos/:id/palestrantes/:idPalestrante -> adiciona um palestrante ao evento
router.post('/:id/palestrantes/:idPalestrante', async (req, res) => {
  const id_evento = lerId(req.params.id);
  const id_palestrante = lerId(req.params.idPalestrante);
  if (!id_evento || !id_palestrante) {
    return res.status(400).json({ erro: 'ID do evento ou do palestrante inválido.' });
  }

  const evento = await prisma.evento.findUnique({ where: { id_evento } });
  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado.' });

  const palestrante = await prisma.palestrante.findUnique({ where: { id_palestrante } });
  if (!palestrante) return res.status(404).json({ erro: 'Palestrante não encontrado.' });

  // Se o vínculo já existir, a chave primária composta barra (erro P2002 -> 409)
  await prisma.evento_palestrante.create({ data: { id_evento, id_palestrante } });

  res.status(201).json(await buscarEvento(id_evento));
});

// DELETE /eventos/:id/palestrantes/:idPalestrante -> remove um palestrante do evento
router.delete('/:id/palestrantes/:idPalestrante', async (req, res) => {
  const id_evento = lerId(req.params.id);
  const id_palestrante = lerId(req.params.idPalestrante);
  if (!id_evento || !id_palestrante) {
    return res.status(400).json({ erro: 'ID do evento ou do palestrante inválido.' });
  }

  const resultado = await prisma.evento_palestrante.deleteMany({
    where: { id_evento, id_palestrante },
  });
  if (resultado.count === 0) {
    return res.status(404).json({ erro: 'Este palestrante não está vinculado a este evento.' });
  }

  res.json(await buscarEvento(id_evento));
});

module.exports = router;
