# Changelog

Todas as mudanças notáveis deste projeto serão documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e o projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- Pesquisa de passagens em milhas (GOL Smiles, LATAM Pass, Azul Infinito)
- Monitoramento diário de rotas com coleta automática de preços
- Gráficos de evolução do preço em milhas (Recharts)
- Alertas por email (Resend) e Telegram quando há variação de preço
- CRUD de rotas monitoradas com pausa/retomada
- Desconto de 10% para clientes Diamante Azul
- Autenticação com email/senha, cadastro e recuperação de senha (Supabase Auth)
- Seed de aeroportos: ~7500 aeroportos globais (OpenFlights) + 300+ brasileiros
- Docker multi-stage para deploy containerizado
- CI/CD via GitHub Actions
