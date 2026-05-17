# Global Checkout MVP

Sistema de checkout completo com Stripe Payment Element, PostgreSQL, e backup em Cloudflare KV.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **PostgreSQL** + Prisma ORM
- **Stripe** Payment Element
- **Cloudflare KV** (backup)
- **TailwindCSS**
- **Meta Pixel** + Conversion API

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

### 3. Configurar banco de dados

```bash
npx prisma db push
npx prisma generate
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

### 5. Acessar

- **Checkout**: http://localhost:3000/checkout?product=Produto&price=1990&currency=brl
- **Admin**: http://localhost:3000/admin/login
- **Sucesso**: http://localhost:3000/success
- **Falha**: http://localhost:3000/failed

## Checkout Dinâmico

O checkout aceita parâmetros via URL:

```
/checkout?product=Nome do Produto&price=1990&currency=brl
```

| Parâmetro | Descrição | Exemplo |
|-----------|-----------|---------|
| `product` | Nome do produto | `Kit Premium` |
| `price` | Preço em centavos | `1990` (= R$ 19,90) |
| `currency` | Moeda | `brl`, `usd`, `eur` |

## Stripe Webhooks

Configure o webhook no painel do Stripe para:

```
https://seudominio.com/api/webhooks/stripe
```

Eventos necessários:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### Testar localmente

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Cloudflare KV

Configure as variáveis:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_KV_NAMESPACE_ID`
- `CLOUDFLARE_API_TOKEN`

O backup é opcional — funciona normalmente sem ele.

## Meta Tracking

Configure:
- `NEXT_PUBLIC_META_PIXEL_ID` — Pixel ID
- `META_ACCESS_TOKEN` — Token de acesso para CAPI

## Admin

- Acesse `/admin/login`
- Senha definida em `ADMIN_PASSWORD`
- Dashboard em `/admin/orders`

## Estrutura

```
src/
├── app/
│   ├── checkout/          # Página de checkout
│   ├── success/           # Página de sucesso
│   ├── failed/            # Página de falha
│   ├── admin/
│   │   ├── login/         # Login admin
│   │   └── orders/        # Dashboard de pedidos
│   └── api/
│       ├── create-payment-intent/  # Criar pagamento
│       ├── webhooks/stripe/        # Webhook Stripe
│       ├── orders/                 # CRUD pedidos
│       └── admin/auth/             # Auth admin
├── components/            # Componentes React
├── lib/                   # Utilitários
├── services/              # Lógica de negócio
└── generated/             # Prisma Client
```

## Deploy

```bash
npm run build
npm start
```
