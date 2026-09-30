// Rotas de PALESTRANTES
const { Router } = require('express');
const prisma = require('../prisma');
const { validarCampos, emailValido, lerId } = require('../validacao');

const router = Router();

// Tamanho máximo igual ao das colunas do SQL
const REGRAS_PALESTRANTE = { nome: 150, email: 150 };

// Valida nome e e-mail; retorna a mensagem de erro ou null
function validarPalestrante(body) {
  const erro = validarCampos(body, REGRAS_PALESTRANTE);
  if (erro) return erro;
  if (!emailValido(body.email.trim())) return 'E-mail inválido.';
  return null;
}

function dadosDoPalestrante(body) {
  return {
    nome: body.nome.trim(),
    email: body.email.trim().toLowerCase(),
  };
}

// GET /palestrantes -> lista os palestrantes
router.get('/', async (req, res) => {
  const palestrantes = await prisma.palestrante.findMany({ orderBy: { nome: 'asc' } });
  res.json(palestrantes);
});

// GET /palestrantes/:id -> busca um palestrante e os eventos de que participa
router.get('/:id', async (req, res) => {
  const id_palestrante = lerId(req.params.id);
  if (!id_palestrante) return res.status(400).json({ erro: 'ID do palestrante inválido.' });

  const palestrante = await prisma.palestrante.findUnique({
    where: { id_palestrante },
    include: { evento_palestrante: { include: { evento: true } } },
  });
  if (!palestrante) return res.status(404).json({ erro: 'Palestrante não encontrado.' });

  res.json({
    id_palestrante: palestrante.id_palestrante,
    nome: palestrante.nome,
    email: palestrante.email,
    eventos: palestrante.evento_palestrante.map((vinculo) => vinculo.evento),
  });
});

// POST /palestrantes -> cadastra um palestrante
router.post('/', async (req, res) => {
  const erro = validarPalestrante(req.body);
  if (erro) return res.status(400).json({ erro });

  const palestrante = await prisma.palestrante.create({ data: dadosDoPalestrante(req.body) });
  res.status(201).json(palestrante);
});

// PUT /palestrantes/:id -> altera um palestrante
router.put('/:id', async (req, res) => {
  const id_palestrante = lerId(req.params.id);
  if (!id_palestrante) return res.status(400).json({ erro: 'ID do palestrante inválido.' });

  const erro = validarPalestrante(req.body);
  if (erro) return res.status(400).json({ erro });

  const palestrante = await prisma.palestrante.update({
    where: { id_palestrante },
    data: dadosDoPalestrante(req.body),
  });
  res.json(palestrante);
});

// DELETE /palestrantes/:id -> exclui um palestrante
// No seu SQL, fk_ep_palestrante é ON DELETE RESTRICT:
// palestrante que está em algum evento não pode ser excluído
router.delete('/:id', async (req, res) => {
  const id_palestrante = lerId(req.params.id);
  if (!id_palestrante) return res.status(400).json({ erro: 'ID do palestrante inválido.' });

  const vinculos = await prisma.evento_palestrante.count({ where: { id_palestrante } });
  if (vinculos > 0) {
    return res.status(409).json({
      erro: `O palestrante está em ${vinculos} evento(s). Remova-o dos eventos antes de excluir.`,
    });
  }

  await prisma.palestrante.delete({ where: { id_palestrante } });
  res.status(204).end();
});

module.exports = router;
