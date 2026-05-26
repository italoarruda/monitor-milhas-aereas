# Contribuindo com o Monitor Milhas Aéreas

Obrigado pelo interesse em contribuir! Siga estas diretrizes para manter a qualidade do projeto.

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Conta no Supabase
- (Opcional) Playwright para testar scrapers

## Setup local

```bash
git clone https://github.com/italoarruda/monitor-milhas-aereas.git
cd monitor-milhas-aereas
pnpm install
cp .env.example .env
# Preencha .env com suas credenciais Supabase
pnpm dev
```

## Executando as migrations

Execute as migrations em ordem no Supabase SQL Editor ou via CLI:

```bash
supabase db push
```

## Seed de aeroportos

```bash
pnpm seed:airports
```

## Testes

```bash
pnpm test
```

## Fluxo de contribuição

1. Fork o repositório
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Faça suas alterações e teste
4. Commit seguindo [Conventional Commits](https://www.conventionalcommits.org/pt-br/): `feat:`, `fix:`, `docs:`, etc.
5. Abra uma Pull Request com o template preenchido

## Scrapers

Os scrapers de LATAM e Azul usam Playwright. As páginas das companhias mudam frequentemente — pull requests com seletores atualizados são sempre bem-vindos.

## Estrutura de diretórios

| Pasta | Conteúdo |
|-------|----------|
| `app/` | Páginas Next.js (App Router) |
| `components/` | Componentes React reutilizáveis |
| `lib/supabase/` | Clientes e queries do Supabase |
| `lib/scrapers/` | Scrapers de cada companhia |
| `lib/notifications/` | Email (Resend) e Telegram |
| `supabase/migrations/` | Migrations SQL |
| `scripts/` | Scripts utilitários |
| `src/test/` | Testes Vitest |
