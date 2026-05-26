# ✈️ Monitor Milhas Aéreas

[![CI](https://github.com/italoarruda/monitor-milhas-aereas/actions/workflows/ci.yml/badge.svg)](https://github.com/italoarruda/monitor-milhas-aereas/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Aplicação web para monitorar o valor de passagens em milhas das principais companhias aéreas brasileiras: **GOL Smiles**, **LATAM Pass** e **Azul Infinito**.

## Funcionalidades

- **Pesquisa de voos** — interface inspirada nas companhias, com autocomplete de aeroportos (IATA)
- **Monitoramento diário** — coleta automática de preços em milhas por rota
- **Gráfico de evolução** — histórico visual do preço em milhas ao longo do tempo
- **Alertas de preço** — notificação por **email** (Resend) e/ou **Telegram** quando o preço cai ou sobe
- **CRUD de rotas** — cadastre, pause e exclua rotas monitoradas
- **Desconto Diamante Azul** — clientes Diamante recebem 10% de desconto no valor em milhas
- **Autenticação completa** — cadastro, login e recuperação de senha

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 + React 19 + TypeScript 5 |
| Styling | Tailwind CSS 4 + Radix UI |
| Banco | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Email | Resend |
| Telegram | Telegram Bot API |
| Scraping | Playwright (headless) |
| Charts | Recharts |
| Testes | Vitest |
| Container | Docker multi-stage |
| Deploy | Netlify + Docker |

## Setup local

### Pré-requisitos

- Node.js 20+
- pnpm 9+
- Projeto no [Supabase](https://supabase.com)

### Instalação

```bash
git clone https://github.com/italoarruda/monitor-milhas-aereas.git
cd monitor-milhas-aereas
pnpm install
cp .env.example .env
```

### Variáveis de ambiente

Preencha `.env` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
RESEND_API_KEY=re_sua-chave-resend
TELEGRAM_BOT_TOKEN=seu-token-do-bot
CRON_SECRET=string-aleatoria-segura
NEXT_PUBLIC_APP_URL=https://monitor-milhas-aereas.netlify.app
```

### Banco de dados

Execute as migrations no Supabase SQL Editor (em ordem):

```
supabase/migrations/0001_airports.sql
supabase/migrations/0002_monitored_routes.sql
supabase/migrations/0003_price_history.sql
supabase/migrations/0004_alert_configs.sql
supabase/migrations/0005_user_profiles.sql
```

Depois popule os aeroportos (~7500 globais + 300+ brasileiros):

```bash
pnpm seed:airports
```

### Desenvolvimento

```bash
pnpm dev
```

Acesse em [http://localhost:3000](http://localhost:3000)

## Testes

```bash
pnpm test
```

## Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=sua-url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-key \
  -t monitor-milhas-aereas .

docker run -p 3000:3000 \
  -e SUPABASE_SERVICE_ROLE_KEY=sua-key \
  -e RESEND_API_KEY=sua-key \
  -e TELEGRAM_BOT_TOKEN=seu-token \
  -e CRON_SECRET=seu-secret \
  monitor-milhas-aereas
```

## Cron de coleta

O endpoint `/api/cron/collect` coleta os preços de todas as rotas ativas. Configure como Netlify Scheduled Function ou chamada externa diária:

```bash
curl -X POST https://seu-app.netlify.app/api/cron/collect \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Configuração do Telegram

1. Crie um bot com [@BotFather](https://t.me/BotFather) e copie o token
2. Inicie uma conversa com [@userinfobot](https://t.me/userinfobot) para obter seu Chat ID
3. Configure ambos no perfil da aplicação

## Aeroportos suportados

- ~7.500 aeroportos globais (via [OpenFlights](https://openflights.org/data.php))
- 300+ aeroportos brasileiros com dados detalhados (via [aeroportos-br](https://github.com/ArthurPavezzi-zz/aeroportos-br))

## Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para instruções de contribuição.

## Licença

[MIT](LICENSE) © 2025 Italo Arruda
