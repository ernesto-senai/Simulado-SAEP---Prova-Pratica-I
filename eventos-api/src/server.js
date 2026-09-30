// Ponto de entrada da API
const express = require('express');
const cors = require('cors');
const eventosRoutes = require('./routes/eventos');
const palestrantesRoutes = require('./routes/palestrantes');
const relatoriosRoutes = require('./routes/relatorios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());         // libera o acesso de um front-end em outra porta
app.use(express.json()); // permite ler JSON no corpo das requisições

app.get('/', (req, res) => {
  res.json({ mensagem: 'API de Eventos e Palestrantes funcionando!' });
});

app.use('/eventos', eventosRoutes);
app.use('/palestrantes', palestrantesRoutes);
app.use('/relatorios', relatoriosRoutes);

// Qualquer rota que não exista
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Tratamento central de erros (o Express 5 captura sozinho os erros das rotas async)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  if (err.name === 'PrismaClientInitializationError') {
    console.error(err.message);
    return res
      .status(500)
      .json({ erro: 'Não foi possível conectar ao MySQL. Confira o DATABASE_URL no .env.' });
  }

  switch (err.code) {
    case 'P2000':
      return res.status(400).json({ erro: 'Um dos campos passou do tamanho máximo permitido.' });
    case 'P2002':
      return res.status(409).json({
        erro: 'Registro duplicado: e-mail já cadastrado ou palestrante já vinculado a este evento.',
      });
    case 'P2003':
      return res.status(409).json({ erro: 'Operação bloqueada por um relacionamento entre as tabelas.' });
    case 'P2025':
      return res.status(404).json({ erro: 'Registro não encontrado.' });
  }

  if (String(err.message).includes('Check constraint')) {
    return res.status(400).json({ erro: 'Dados recusados pelas regras (CHECK) do banco.' });
  }

  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
