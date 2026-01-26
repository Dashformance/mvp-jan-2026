# Sprint 9: Data Viz & Estratégia

**Foco:** Implementação dos gráficos avançados dos Tiers 1 e 2.

## 📊 Tier 1: Dual Gauges (ApexCharts)
- [ ] Criar componente `DualGauge.tsx`.
- [ ] Configurar `RadialBar` com gradiente e zonas de cor (Crítico -> Excelente).
- [ ] Criar ponteiro SVG animado (`GaugePointer.tsx`) com Framer Motion.
- [ ] Implementar labels numéricos posicionados geometricamente.

## 💡 Tier 1: Insight Alert
- [ ] Criar componente `InsightAlert.tsx`.
- [ ] Implementar lógica simples de diagnóstico (`generateInsight(pace, quality)`).
- [ ] Animação de entrada/saída.

## 📈 Tier 2: Flow Chart (Recharts)
- [ ] Criar componente `FlowChart.tsx` (AreaChart).
- [ ] Definir `<defs>` SVG para os gradientes neon ("fade to transparent").
- [ ] Custom Tooltip (`GlassTooltip`) que mostra dados de Leads vs Vendas.
- [ ] Adicionar botão "Comparar Semana Anterior" (apenas visual/mock por enquanto).

## 📉 Sparklines
- [ ] Criar `Sparkline.tsx` usando Recharts minimalista (sem eixos).
- [ ] Integrar nos Cards de KPI Totais (Topo).

## ✅ Critérios de Aceite
- [ ] Gauges animam ao carregar.
- [ ] Gráficos são responsivos (width: 100%).
- [ ] Tooltips aparecem corretamente (z-index) e legíveis.
