# Sprint 12: Kanban Arena & Gamificação High-Fidelity

Esta sprint foca na evolução visual e funcional do Kanban para o padrão **Liquid Glass 2.0**, transformando-o em uma ferramenta didática e engajadora (Arena).

## User Review Required

> [!IMPORTANT]
> **Gamificação Hierárquica**: Substituiremos a visualização de score numérico simples por Tiers Visuais (Bronze, Silver, Gold, Diamond, Legendary).
> **Didática**: Implementação do sistema de "Hints" (Dicas) nos cards para guiar SDRs/Closers.

---

## 🏗️ Parte 1: Arquitetura & Estados

### [Componente] Kanban UI Refactor
- **Glassmorphism**: Aplicação de `backdrop-filter: blur(12px)` e gradientes nas bordas.
- **Performance**: Otimização do drag behavior para evitar "jank" em listas grandes.

---

## 🎨 Parte 2: Redesign dos Componentes

### #### [MODIFY] [KanbanCard.tsx](file:///Users/joaovitorgarcia/Desktop/ANTIPROJECTS/DASHFORMANCE/client/components/kanban/KanbanCard.tsx)
- [ ] **Tiers Visuais**:
    - **Legendary (>90)**: Borda Dourada com brilho pulsante (Shimmer).
    - **Diamond (75-89)**: Borda Cyan com reflexos metálicos.
    - **Gold (60-74)**: Borda Dourada fosca.
    - **Silver (40-59)**: Borda Prata sutil.
- [ ] **Didática**:
    - Adicionar badge de "Qualificação" (ex: "Perfil Decisor", "Grande Porte").
    - Tooltip de "Próximo Passo" baseado no status atual do lead.
- [ ] **Interatividade**: Glow sutil que segue o cursor (hover).

### #### [MODIFY] [KanbanColumn.tsx](file:///Users/joaovitorgarcia/Desktop/ANTIPROJECTS/DASHFORMANCE/client/components/kanban/KanbanColumn.tsx)
- [ ] **Header Pro**: Exibir média de score da coluna e total monetário (`contract_value`).
- [ ] **Zonas de Drop**: Animação de expansão e glow champagne quando o item é arrastado sobre a coluna.

### #### [MODIFY] [KanbanBoard.tsx](file:///Users/joaovitorgarcia/Desktop/ANTIPROJECTS/DASHFORMANCE/client/components/kanban/KanbanBoard.tsx)
- [ ] **Layout Arena**: Background com gradiente radial profundo.
- [ ] **Empty States**: Ilustrações minimalistas em colunas vazias.

---

## 📈 Parte 3: Integração RPG

#### [MODIFY] [leads-service.ts](file:///Users/joaovitorgarcia/Desktop/ANTIPROJECTS/DASHFORMANCE/client/lib/services/leads-service.ts)
- [ ] Ajustar multiplicadores de XP para ações no Kanban (Status Change).
- [ ] Garantir que o `contract_value` seja refletido instantaneamente nos cálculos de XP de venda (`SOLD`).

---

## ✅ Plano de Verificação

### Automatizado
- [ ] Validar cálculos de somatório nas colunas com diferentes valores decimais.
- [ ] Verificar integridade da transição de XP no banco de dados.

### Manual / Visual
- [ ] Testar suavidade do drag-and-drop no Chrome e Safari.
- [ ] Validar leitura dos textos sobre os efeitos de Glassmorphism.
