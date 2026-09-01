# HelpDesk API

API REST para abertura, atendimento e encerramento de chamados. Foi pensada para ser hospedada no **Render** e usar PostgreSQL do **Aiven**, enquanto um front-end separado a consome via JSON.

## Recursos

- Cadastro de clientes, login e senha protegida com `bcryptjs`.
- Autenticação das rotas privadas com JWT (`Authorization: Bearer <token>`).
- Chamados com status `Aberto`, `Em Atendimento` e `Concluído`.
- Clientes veem somente seus chamados; técnicos veem e atualizam todos.
- Comentários por chamado, validação/sanitização de entrada, rate limit, Helmet e CORS restrito.
- Documentação Swagger em `/api-docs`.
- Queries parametrizadas com `pg`, sem concatenação de dados em SQL.

## Requisitos

- Node.js 20 ou superior
- Uma base PostgreSQL (local ou Aiven)

## Instalação local

```bash
npm install
Copy-Item .env.example .env
# edite o arquivo .env com os valores reais
npm run migrate
npm run dev
```

A API estará em `http://localhost:3000`; a documentação interativa estará em `http://localhost:3000/api-docs`.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `NODE_ENV` | Não | `development` ou `production`. |
| `PORT` | Não | Porta HTTP; o Render define esta variável automaticamente. |
| `FRONTEND_URL` | Sim em produção | Origem exata permitida pelo CORS, por exemplo `https://meu-front.vercel.app`. |
| `API_URL` | Não localmente; recomendada em produção | URL pública da API, por exemplo `https://minha-api.onrender.com`. Permite testar a API pelo Swagger hospedado. |
| `DATABASE_URL` | Sim | String de conexão PostgreSQL do Aiven. O parâmetro `sslmode` nela é ignorado; use `DATABASE_SSL` para controlar TLS. |
| `DATABASE_SSL` | Sim no Aiven | Use `true` para conexão TLS. |
| `JWT_SECRET` | Sim | Segredo longo, aleatório e exclusivo do ambiente. |
| `JWT_EXPIRES_IN` | Não | Duração dos tokens, padrão `8h`. |

Nunca versione `.env` nem exponha credenciais do Aiven ou o segredo JWT.

## Migrações e técnicos

`npm run migrate` cria as tabelas `usuarios`, `chamados` e `comentarios_chamado`. O cadastro público cria apenas clientes; isso impede que alguém se torne técnico por uma requisição. Após criar o primeiro usuário, promova-o a técnico diretamente no banco com uma query parametrizada na sua ferramenta PostgreSQL:

```sql
UPDATE usuarios SET role = 'tecnico' WHERE email = 'tecnico@empresa.com';
```

## Endpoints principais

| Método | Rota | Acesso |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Público |
| `POST` | `/api/v1/auth/login` | Público |
| `GET` | `/api/v1/auth/me` | JWT |
| `POST` | `/api/v1/chamados` | JWT |
| `GET` | `/api/v1/chamados?status=Aberto` | JWT |
| `GET` | `/api/v1/chamados/:id` | JWT |
| `PATCH` | `/api/v1/chamados/:id` | JWT de técnico |
| `POST` | `/api/v1/chamados/:id/comentarios` | JWT |

Exemplo para atualização de status:

```http
PATCH /api/v1/chamados/1
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "Em Atendimento" }
```

## Deploy

1. Crie um serviço PostgreSQL no Aiven e copie a string de conexão TLS para `DATABASE_URL`.
2. Faça push deste repositório para o GitHub e crie um Web Service no Render, ou use o `render.yaml` incluso.
3. No Render, preencha `DATABASE_URL` e `FRONTEND_URL`; confirme `DATABASE_SSL=true` e gere um `JWT_SECRET` forte.
4. Antes do primeiro deploy (e antes de cada migration nova), configure o `.env` local com a `DATABASE_URL` do Aiven e execute `npm run migrate`. Esse comando conecta diretamente ao Aiven e registra as migrations já aplicadas; portanto é seguro executá-lo novamente.
5. No Render, use `npm install` como Build Command e `npm start` como Start Command. Não configure Pre-deploy Command no plano Free.
6. No Vercel, configure a URL pública da API como variável do front-end e use a URL do Vercel em `FRONTEND_URL` no Render.

Use `GET /health` como health check do Render.
