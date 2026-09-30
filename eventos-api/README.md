# API de Eventos e Palestrantes — Node.js + Express + Prisma + MySQL

## Passo a passo

1. **Criar o banco no seu MySQL**
   Abra o MySQL Workbench, conecte no seu servidor local, abra o arquivo
   `sql/banco_eventos.sql` (File → Open SQL Script) e execute tudo no botão do raio ⚡.
   É o seu SQL do OneCompiler com 3 linhas no topo que criam o banco `eventos_db`
   (o OneCompiler não guarda o banco, por isso precisa rodar no seu MySQL).

2. **Abrir o projeto no VS Code**
   Descompacte o zip, abra a pasta `eventos-api` no VS Code e abra o terminal (Ctrl + ').

3. **Instalar as dependências**
   ```
   npm install
   ```

4. **Configurar a conexão**
   Renomeie `.env.example` para `.env` e troque `SUA_SENHA` pela senha do seu MySQL.

5. **Gerar o Prisma Client**
   ```
   npx prisma generate
   ```
   Não rode `npx prisma migrate dev`: as tabelas já foram criadas pelo seu SQL
   e o migrate tentaria apagar o banco para recriá-lo.
   (Opcional) Para testar a conexão: `npx prisma db pull --print`
   — ele lê o MySQL e mostra os models na tela, sem alterar nada.

6. **Rodar a API**
   ```
   npm run dev
   ```
   Abra http://localhost:3000/eventos no navegador.

7. **Testar**
   Instale a extensão **REST Client** no VS Code, abra `requests.http`
   e clique em **Send Request** acima de cada requisição.

## Rotas

| Método | Rota | O que faz |
|---|---|---|
| GET | /eventos | Lista eventos com seus palestrantes |
| GET | /eventos/:id | Seleciona um evento |
| POST | /eventos | Cadastra evento |
| PUT | /eventos/:id | Altera evento |
| DELETE | /eventos/:id | Exclui evento |
| POST | /eventos/:id/palestrantes/:idPalestrante | Adiciona palestrante ao evento |
| DELETE | /eventos/:id/palestrantes/:idPalestrante | Remove palestrante do evento |
| GET | /palestrantes | Lista palestrantes |
| GET | /palestrantes/:id | Palestrante com seus eventos |
| POST | /palestrantes | Cadastra palestrante |
| PUT | /palestrantes/:id | Altera palestrante |
| DELETE | /palestrantes/:id | Exclui palestrante (só se não estiver em evento) |
| GET | /relatorios/eventos | View vw_eventos_palestrantes |
| GET | /relatorios/palestrantes | View vw_palestrantes_eventos |
| GET | /relatorios/vinculos | View vw_evento_palestrante_detalhe |

## Se der erro

- **Environment variable not found: DATABASE_URL** → o `.env` precisa estar na raiz do
  projeto (mesma pasta do `package.json`), não dentro de `prisma/` ou `src/`.
- **Authentication failed (P1000)** → senha ou usuário errado no `.env`.
- **Table 'eventos_db.evento' doesn't exist** → o SQL não foi executado no banco
  `eventos_db`; rode de novo o `sql/banco_eventos.sql` inteiro.
- **@prisma/client did not initialize yet** → rode `npx prisma generate`.
