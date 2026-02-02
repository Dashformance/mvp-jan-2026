# Regra de Ouro: Integridade de Atribuição de Leads

Esta regra é CRÍTICA e não deve ser violada.

## Objetivo
Garantir que os leads sempre permaneçam atribuídos aos seus respectivos donos (João Vitor, Vitor Nitz, Bruno, etc.) durante qualquer processo de manutenção ou refatoração.

## Diretrizes
1. **Preservação de Campos**: Nunca remova ou altere os campos `owner` (string) e `owner_id` (UUID) da tabela `leads` sem uma migração de dados explícita e validada.
2. **Relacionamentos Prisma**: Ao refatorar modelos no Prisma, use sempre `@@map` para manter a compatibilidade com a estrutura de dados atual, garantindo que as Foreign Keys de ownership não sejam corrompidas.
3. **Filtros de Visibilidade**: Em todas as queries de listagem (Kanban ou Tabela), verifique se o filtro por `owner_id` ou `owner` está sendo respeitado para manter a privacidade/divisão correta entre os usuários.
4. **Logs de Atribuição**: Sempre que um lead for movido ou editado, o sistema de `activities` deve registrar a ação mantendo o `user_id` de quem executou, sem sobrescrever o `owner` original do lead a menos que seja uma ação de "Transferência" deliberada.

## Verificação Pós-Alteração
Após qualquer alteração no banco ou nos serviços de lead:
- Validar se a query `leads.findMany({ where: { owner_id: '...' } })` retorna o número esperado de registros.
- Garantir que o Dashboard de Performance continue refletindo os pontos corretamente para o usuário logado.
