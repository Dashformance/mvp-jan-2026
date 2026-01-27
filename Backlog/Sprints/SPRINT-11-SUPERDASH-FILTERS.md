# SPRINT 11: SuperDash Date Filters & Arena Polish

## 🎯 Objetivos
Implementar um sistema robusto de filtragem por período no SuperDash e corrigir bugs visuais críticos identificados pelo time.

---

## 🛠️ Detalhamento Técnico

### 1. Hotfix: Ranking do Time (Bug Visual)
**Problema:** URLs de avatares estão sendo renderizadas como texto puro sobre os nomes dos jogadores.
**Solução:** 
- Ajustar `client/components/arena/Leaderboard.tsx` para detectar se `player.avatar` é uma URL ou iniciais.
- Implementar renderização condicional: `<img src={...} />` para URLs e `<span>Initials</span>` para texto.
- Adicionar fallback elegante para imagens quebradas.

### 2. Filtro de Período (Novo Recurso)
Adicionar um seletor de data logo acima da "Arena do Time" que afete globalmente os dados do dashboard.

#### Frontend
- **Componente:** `DateFilterToggle.tsx` (Estilo Premium/Glassmorphism).
- **Opções:** 
  - `HOJE`: Dados apenas do dia atual.
  - `7 DIAS`: Últimos 7 dias.
  - `15 DIAS`: Últimos 15 dias.
  - `PERSONALIZADO`: Acesso a um Date Range Picker.
- **Integração:** Adicionar ao `SuperDashPage` e atualizar o hook de `fetchData` para reagir às mudanças de estado.

#### Backend (API & Services)
- **API `route.ts`**: Receber `period`, `start` e `end` via query string.
- **Lógica de Datas**: Calcular dinamicamente o `SEASON_START_DATE` com base na seleção.
- **Service `leads-service.ts`**: Garantir que as consultas de `PerformanceByOwner` e `ConversionFunnel` utilizem os filtros de data de forma estrita.

---

## 📅 Cronograma Sugerido
1. **Dia 1**: Correção do Ranking + Estrutura do Filtro (UI).
2. **Dia 2**: Implementação da Lógica de Backend + Service Updates.
3. **Dia 3**: Integração Final + Testes de Stress (Custom Dates).

---

## ✅ Critérios de Aceite
- [ ] O ranking deve mostrar fotos reais (ou iniciais) sem poluição de texto.
- [ ] Ao clicar em "7 Dias", todos os KPIs (Receita, Vendas, Leads) devem atualizar instantaneamente.
- [ ] A Arena do Time deve refletir o empenho/score do período selecionado.
- [ ] O filtro personalizado deve permitir selecionar qualquer intervalo de datas válido.

> **Status:** Aguardando início (Sprint Backlog)
