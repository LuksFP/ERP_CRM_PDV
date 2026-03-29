# Backend — Guia de Início para o Dev

## Contexto do Projeto

SaaS ERP multi-tenant para pequenos e médios comércios. Três planos:
- **Starter** R$199/mês — dashboard, estoque, PDV, até 5 usuários, 1 filial
- **Professional** R$349/mês — + CRM, financeiro, fiscal, até 15 usuários, 2 filiais
- **Enterprise** R$599/mês — tudo ilimitado + compras + API

O sistema tem **dois frontends**:
- `apps/admin` (porta 3002) — painel interno da empresa (superadmin, suporte, vendas, técnico)
- `apps/web` (porta 3001) — app do cliente/tenant (dono, gerente, caixa, etc.)

---

## Estrutura do Monorepo

```
apps/
├── admin/          ← frontend admin (React + Vite)
├── web/            ← frontend tenant (React + Vite)
└── api/            ← backend (Fastify + Prisma + PostgreSQL) ← VOCÊ ESTÁ AQUI

packages/
└── shared-types/   ← tipos TypeScript compartilhados (Product, Sale, Tenant, etc.)
```

---

## Stack do Backend

| O quê | Tecnologia |
|-------|-----------|
| Framework | Fastify v4 |
| ORM | Prisma 5 |
| Banco | PostgreSQL |
| Auth | JWT (access token 7d + refresh token) |
| Validação | Zod |
| Runtime | Node.js 20+ com tsx (dev) |

---

## Setup Inicial

```bash
# 1. Instalar dependências
cd apps/api
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# editar .env com sua DATABASE_URL e JWT_SECRET

# 3. Rodar migrations
pnpm db:migrate

# 4. Seed inicial (admin users, planos)
pnpm db:seed

# 5. Iniciar em dev
pnpm dev
```

---

## Arquitetura de Pastas

```
apps/api/src/
├── server.ts              ← entry point, registra plugins e rotas
├── config/
│   └── env.ts             ← validação de env vars com Zod (não usa process.env diretamente)
├── routes/                ← apenas registra handlers, sem lógica
│   ├── auth.ts
│   ├── tenants.ts
│   ├── products.ts
│   ├── sales.ts
│   ├── users.ts
│   ├── branches.ts
│   ├── contacts.ts
│   ├── deals.ts
│   └── financial.ts
├── controllers/           ← recebe req/reply, chama service, retorna resposta
├── services/              ← lógica de negócio (não conhece HTTP)
├── repositories/          ← acesso ao banco via Prisma (não conhece HTTP)
├── middlewares/
│   └── auth.ts            ← authenticate() e requireRole() já implementados
├── schemas/               ← schemas Zod para validar req.body
├── utils/
└── types/
```

**Fluxo obrigatório:** `routes → controllers → services → repositories`

Nunca coloque lógica de negócio no controller, nunca faça query Prisma direta no service.

---

## Multi-tenancy

**Todo dado é isolado por `tenantId`.**

O `tenantId` vem do JWT — já está implementado no middleware:

```ts
import { getTenantId } from '../middlewares/auth.js'

// Em qualquer route handler:
const tenantId = getTenantId(req)
// Sempre filtre queries com este tenantId
```

Nunca confie em `tenantId` vindo do body ou query string — sempre do JWT.

---

## Autenticação

Dois tipos de usuário com tokens separados:

| Tipo | Tabela | Roles |
|------|--------|-------|
| TenantUser | `tenant_users` | owner, manager, cashier, stock_clerk, seller, financial |
| AdminUser  | `admin_users`  | superadmin, support, sales, technician |

O JWT payload deve incluir:
```ts
{ sub: userId, tenantId, role, type: 'tenant' | 'admin' }
```

**Impersonation**: superadmin e support podem logar como qualquer TenantUser via `POST /api/v1/tenants/:id/impersonate`. O token resultante deve ter `isImpersonation: true` no payload para o frontend exibir o banner de aviso.

---

## Envelope de Resposta

```ts
// Sucesso
{ "data": ... }

// Lista paginada
{ "data": [...], "meta": { "page": 1, "perPage": 50, "total": 200, "totalPages": 4 } }

// Erro
{ "error": { "code": "USER_NOT_FOUND", "message": "Usuário não encontrado." } }
```

Todos os tipos estão em `packages/shared-types/src/index.ts`:
```ts
import type { ApiResponse, ApiListResponse, ApiError } from '@erp/shared-types'
```

---

## Banco de Dados — Decisões Importantes

1. **Row-Level Security**: todo model tem `tenantId` indexado. Sempre inclua no WHERE.
2. **Transações**: abertura/fechamento de caixa, vendas e movimentação de estoque devem usar `prisma.$transaction`.
3. **Soft delete**: não deletar produtos com vendas — setar `isActive: false`.
4. **Paginação**: nunca `findMany()` sem `take` e `skip`.
5. **N+1**: usar `include` ou batch ao buscar relações.

---

## Rotas já mapeadas (todas retornam 501 — implemente)

### Auth
```
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Produtos
```
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
POST   /api/v1/products/:id/stock-movement
```

### Vendas
```
GET  /api/v1/sales
GET  /api/v1/sales/:id
POST /api/v1/sales
POST /api/v1/sales/:id/complete
POST /api/v1/sales/:id/cancel
```

### Usuários
```
GET    /api/v1/users
POST   /api/v1/users
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Filiais & PDVs
```
GET  /api/v1/branches
POST /api/v1/branches
PATCH /api/v1/branches/:id
GET  /api/v1/branches/:id/pdvs
POST /api/v1/branches/:id/pdvs
```

### CRM
```
GET    /api/v1/contacts
POST   /api/v1/contacts
PATCH  /api/v1/contacts/:id
DELETE /api/v1/contacts/:id
GET    /api/v1/deals
POST   /api/v1/deals
PATCH  /api/v1/deals/:id
PATCH  /api/v1/deals/:id/stage
DELETE /api/v1/deals/:id
```

### Financeiro
```
GET  /api/v1/financial/transactions
POST /api/v1/financial/transactions
PATCH /api/v1/financial/transactions/:id
POST /api/v1/financial/transactions/:id/pay
GET  /api/v1/financial/cashflow
GET  /api/v1/financial/dre
```

### Tenants (admin-only)
```
GET  /api/v1/tenants
GET  /api/v1/tenants/:id
POST /api/v1/tenants
PATCH /api/v1/tenants/:id
POST /api/v1/tenants/:id/suspend
POST /api/v1/tenants/:id/impersonate
```

---

## Tipos Compartilhados

Em `packages/shared-types/src/index.ts` estão todos os tipos de entidade que o front usa.
Quando o backend retornar dados, eles devem seguir exatamente esses contratos.

---

## Health Check

```
GET /health → { "status": "ok", "timestamp": "..." }
```

Já implementado em `server.ts`.

---

## Próximos Passos Sugeridos

1. Setup PostgreSQL local e rodar `pnpm db:migrate`
2. Implementar `POST /auth/login` (bcrypt + JWT)
3. Implementar `GET /products` com paginação
4. Implementar `POST /sales` com transação Prisma (estoque + venda)
5. Implementar `GET /tenants` (admin)
