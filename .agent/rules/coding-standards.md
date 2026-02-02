# Padrões de Código e Arquitetura

Diretrizes para manter o Dashformance escalável e organizado.

## TypeScript e Next.js
- Use **Server Actions** para mutações de dados onde possível.
- Componentes de UI devem ser preferencialmente "dumb components" (focados apenas em visual), recebendo estado via props.
- Use **Zod** para validação de esquemas de API e formulários.

## Banco de Dados (Prisma)
- Modelos devem usar `PascalCase` (ex: `Lead`, `Interaction`).
- Sempre que houver necessidade de renomear um modelo ou campo, use `@@map` ou `@map` para não quebrar a estrutura física do banco de dados existente.
- Adicione índices (`@@index`) em campos frequentemente filtrados, como `owner_id` e `status`.

## Serviços (Service Layer)
- Mantenha a lógica de negócio dentro de `client/lib/services/`.
- Cada método de serviço deve ter um `try-catch` padronizado e retornar um objeto consistente ou lançar erros tratados.
- Documente métodos complexos usando TSDoc (ex: cálculos de pontuação/gamificação).

## API Routes
- Siga o padrão REST.
- Endpoints de performance/estatística devem ser centralizados no `AnalyticsService`.
- Use middlewares para verificação de sessão e roles.
