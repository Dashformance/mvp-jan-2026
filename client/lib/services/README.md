# 🧠 Dashformance: Guia de Serviços do Backend (Service Layer)

Este diretório contém a lógica de negócio central do Dashformance. Todos os serviços utilizam o Prisma Client para persistência e o Supabase para operações auxiliares.

## 📋 Lista de Serviços

### 1. [leads-service.ts](./leads-service.ts)
- **Responsabilidade**: CRUD central de leads, gestão de status do Kanban e atribuição de donos.
- **Funções Chave**:
    - `getLeads()`: Listagem com filtros avançados.
    - `updateLeadStatus()`: Lógica de movimentação entre colunas.
    - `assignOwner()`: Atribuição de leads respeitando a integridade dos dados.
- **Importante**: Nunca remova o filtro de `owner_id` em operações de leitura iniciadas pela UI do usuário.

### 2. [analytics-service.ts](./analytics-service.ts)
- **Responsabilidade**: Cálculos complexos para os Dashboards e métricas de performance (TV e Arena).
- **Funções Chave**:
    - `getPerformanceStats()`: Dados para o gráfico "Butterfly" (João vs Vitor).
    - `getConversionFunnel()`: Saúde do pipeline.
    - `getSalesForce()`: Ranking de pontuação (gamificação).

### 3. [extraction-service.ts](./extraction-service.ts)
- **Responsabilidade**: Integração com a API Casa dos Dados (CNPJ) e importação em lote.
- **Fluxo**: Busca na API -> Sanitização -> Mapeamento IA -> Persistência.

### 4. [lead-sanitizer.ts](./lead-sanitizer.ts)
- **Responsabilidade**: Padronização de strings (nomes, telefones, CNPJs) antes da postagem no banco.
- **Garantia**: Evita duplicatas visuais e padroniza o formato para buscas eficientes.

### 5. [interactions-service.ts](./interactions-service.ts)
- **Responsabilidade**: Log automático de atividades (WhatsApp, Email, Notas).
- **Regra**: Cada interação deve estar vinculada obrigatoriamente a um `lead_id` e um `user_id` (autor).

---

## 🛠️ Como estender o sistema
Para adicionar uma nova funcionalidade (ex: Integração WhatsApp), siga este fluxo:
1. Adicione os campos necessários em `schema.prisma`.
2. Crie/Atualize o serviço correspondente em `client/lib/services/`.
3. Crie a Server Action em `client/app/actions/`.
4. Implemente o componente de UI consumindo a Action.
