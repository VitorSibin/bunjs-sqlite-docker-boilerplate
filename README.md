# Bun + SQLite Boilerplate

Boilerplate para aplicações web com autenticação completa. Inclui backend com API REST em Bun, banco de dados SQLite e frontend em HTML/CSS/JS puro com telas de home, login, cadastro e dashboard protegido.

---

## Stack

- **Runtime:** [Bun](https://bun.sh)
- **Framework:** [Hono](https://hono.dev)
- **Banco de dados:** SQLite via `bun:sqlite`
- **Autenticação:** JWT via `jose`
- **Frontend:** HTML, CSS e JS puro
- **Containerização:** Docker + Docker Compose

---

## Estrutura do projeto

```
webapp-boilerplate/
├── data/
│   └── .gitkeep          # pasta do arquivo .db (ignorada pelo git)
├── src/
│   ├── db/
│   │   ├── client.ts     # conexão com o SQLite
│   │   └── migrate.ts    # criação das tabelas
│   ├── lib/
│   │   └── jwt.ts        # geração e verificação de tokens JWT
│   ├── middleware/
│   │   └── auth.middleware.ts  # proteção de rotas autenticadas
│   ├── modules/
│   │   ├── auth/
│   │   │   └── auth.routes.ts  # rotas de registro e login
│   │   └── words/
│   │       └── words.routes.ts # exemplo de módulo protegido
│   ├── public/
│   │   ├── css/
│   │   │   ├── style.css       # estilos globais e variáveis
│   │   │   ├── home.css        # estilos da home page
│   │   │   ├── auth.css        # estilos das telas de login/cadastro
│   │   │   └── app.css         # estilos do dashboard
│   │   ├── js/
│   │   │   └── auth.js         # lógica de autenticação no frontend
│   │   ├── index.html          # home page pública
│   │   ├── login.html          # login e cadastro
│   │   ├── forgot-password.html
│   │   └── app.html            # dashboard protegido
│   └── server.ts               # entry point da API
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## Fluxo das telas

```
index.html (home pública)
    │
    ├── [Entrar] ──────────────────► login.html
    │                                    │
    │                                    ├── aba "Entrar"
    │                                    │       └── POST /auth/login
    │                                    │               └── salva token no localStorage
    │                                    │                       └── redireciona para app.html
    │                                    │
    │                                    └── aba "Criar conta"
    │                                            └── POST /auth/register
    │                                                    └── faz login automático
    │                                                            └── redireciona para app.html
    │
    └── [Criar conta] ─────────────► login.html (mesma tela, aba de cadastro)


app.html (dashboard protegido)
    │
    ├── verifica token no localStorage ao carregar
    │       └── sem token ──────────► redireciona para login.html
    │
    ├── sidebar com navegação
    ├── cards de métricas (personalizáveis)
    ├── tabela de registros (personalizável)
    └── [Sair] ─────────────────────► remove token e redireciona para login.html
```

### Proteção das rotas

A proteção acontece em duas camadas:

**Frontend** — o `auth.js` verifica se existe um token no `localStorage` ao carregar qualquer página protegida. Se não existir, redireciona para o login imediatamente.

**API** — o `authMiddleware` valida o token JWT em toda requisição feita às rotas protegidas. Mesmo que alguém acesse o HTML diretamente, nenhum dado será retornado sem um token válido.

---

## Como rodar

### Pré-requisitos

- [Docker](https://www.docker.com) instalado
- [Bun](https://bun.sh) instalado (apenas para desenvolvimento local)

### Com Docker (recomendado)

```bash
# clonar o repositório
git clone https://github.com/seu-usuario/webapp-boilerplate.git
cd webapp-boilerplate

# subir o container
docker compose up --build
```

A aplicação estará disponível em `http://localhost:3000`.

### Localmente sem Docker

```bash
bun install
bun run src/server.ts
```

---

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `JWT_SECRET` | Chave secreta para assinar os tokens JWT | `dev_secret` |

Para produção, defina a variável no `docker-compose.yml`:

```yaml
environment:
  - JWT_SECRET=sua_chave_secreta_aqui
```

Ou crie um arquivo `.env` na raiz e adicione ao `.gitignore`.

---

## Rotas da API

### Autenticação

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| POST | `/auth/register` | Cadastra novo usuário | Não |
| POST | `/auth/login` | Autentica e retorna JWT | Não |

#### Exemplo de registro

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@email.com","password":"senha123"}'
```

#### Exemplo de login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@email.com","password":"senha123"}'
```

Retorno:
```json
{ "token": "eyJhbGci..." }
```

### Rotas protegidas (exemplo com words)

Todas as rotas protegidas exigem o header `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/words` | Lista registros do usuário |
| POST | `/words` | Cria novo registro |
| DELETE | `/words/:id` | Remove um registro |

---

## Banco de dados

O SQLite gera automaticamente o arquivo `data/vocab.db` na primeira execução. As tabelas são criadas pelo `src/db/migrate.ts` que roda junto com o servidor.

### Tabelas

```sql
-- Usuários
CREATE TABLE users (
  id           TEXT PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at   INTEGER DEFAULT (unixepoch())
);

-- Exemplo de entidade (words)
CREATE TABLE words (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  word        TEXT NOT NULL,
  translation TEXT NOT NULL,
  example     TEXT,
  level       INTEGER DEFAULT 0,
  next_review INTEGER,
  created_at  INTEGER DEFAULT (unixepoch())
);
```

---

## Como adaptar para seu projeto

### 1. Renomear o app

Busque por `AppName` nos arquivos HTML e substitua pelo nome do seu projeto.

### 2. Criar um novo módulo

Copie a pasta `src/modules/words/` e adapte para sua entidade. Registre as rotas no `server.ts`:

```ts
import { minhaEntidade } from "./modules/minha-entidade/minha-entidade.routes";
app.route("/minha-entidade", minhaEntidade);
```

### 3. Adicionar novas tabelas

Adicione os `CREATE TABLE` no arquivo `src/db/migrate.ts`.

### 4. Personalizar o dashboard

Edite o `src/public/app.html` substituindo os cards de métricas, colunas da tabela e itens da sidebar pelo conteúdo da sua aplicação.

### 5. Adicionar o email ao token JWT

Para exibir o email do usuário no dashboard, atualize o `src/lib/jwt.ts`:

```ts
export async function signToken(userId: string, email: string) {
  return await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}
```

E passe o email ao chamar `signToken` no login.

---

## Deploy no Debian

```bash
# instalar Docker no servidor
curl -fsSL https://get.docker.com | sh

# clonar e subir
git clone https://github.com/seu-usuario/webapp-boilerplate.git
cd webapp-boilerplate
docker compose up -d --build
```

Para rodar na porta 80, altere o `docker-compose.yml`:

```yaml
ports:
  - "80:3000"
```

---

## Licença

MIT
