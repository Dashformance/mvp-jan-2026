# SUPERDASH — Briefing Técnico Completo

> **Projeto:** Superdash (Cockpit de Performance Comercial)  
> **Produto:** Dashformance (CRM de Prospecção B2B)  
> **Stack:** Next.js 15+ | React 19 | TailwindCSS v4 | Framer Motion | Recharts  
> **Versão:** 2.0

---

## 1. Visão Geral

O Superdash é a **página inicial** da plataforma — um cockpit de performance comercial que transforma dados de CRM em uma **experiência gamificada**.

### Problemas que Resolve

| Problema | Solução |
|----------|---------|
| Cegueira de Ritmo | Gauges em tempo real |
| Desengajamento | Sistema de XP, níveis e badges |
| Gestão Reativa | Visão intraday ao vivo |

### Filosofia Visual

- **Fundo:** Carvão profundo (#0A0A0A a #181818)
- **Destaque premium:** Champagne (#DECCA8)
- **Feedback funcional:** Neons (verde, amarelo, vermelho, cyan)
- **Elevação:** Glassmorphism (blur + transparência)
- **Tipografia numérica:** Space Grotesk

---

## 2. Arquitetura de Informação

```
TIER 1: PULSO      → "Como está a empresa AGORA?"
TIER 2: TENDÊNCIAS → "Para onde estamos indo?"
TIER 3: ARENA      → "Quem está performando?"
TIER 4: AÇÕES      → "O que fazer agora?"
```

---

## 3. Componentes Essenciais

### Gauge Semicircular
- Arco 270° com gradiente (vermelho→amarelo→verde)
- Ponteiro animado (spring physics)
- Valor central grande + status text
- Glow na cor do status

### KPI Card Gamificado
- Valor em cor temática com glow
- Barra de XP
- Botão de ação rápida [+]
- Hover: lift + shadow

### PlayerCard RPG
- Avatar com XP Ring
- Badge de nível e liga (bronze→diamond)
- Mini funil (Contatos → Reuniões → Vendas)
- Badges conquistados
- Status indicator

### Leaderboard
- Top 3 com medalhas 🥇🥈🥉
- Background dourado para 1º lugar
- XP + Nível

### InsightAlert
- Pill centralizada
- Lógica automática baseada em Empenho × Conversão
- Cores: insight (champagne), warning (amarelo), success (verde), critical (vermelho)

---

## 4. Sistema de XP

| Ação | XP |
|------|-----|
| Mover card | 2 |
| Registrar nota | 5 |
| Fazer ligação | 5 |
| Agendar reunião | 25 |
| Realizar reunião | 30 |
| Fechar venda | 100-200 |
| Streak 7 dias | 200 |

### Ranks por Nível

| Rank | Níveis | Cor |
|------|--------|-----|
| Bronze | 1-9 | #CD7F32 |
| Prata | 10-19 | #C0C0C0 |
| Ouro | 20-29 | #FFD700 |
| Platina | 30-39 | #E5E4E2 |
| Diamante | 40-49 | #B9F2FF |
| Ícone | 50 | #FF00FF |

---

## 5. Especificações Técnicas

### Gauge
```typescript
{
  size: 200-240,
  arcAngle: 270,
  strokeWidth: 14,
  pointerAnimation: {
    type: "spring",
    stiffness: 50,
    damping: 15
  },
  colorStops: [
    { offset: 0, color: "#FF4757" },
    { offset: 30, color: "#FF9F43" },
    { offset: 50, color: "#FFE066" },
    { offset: 70, color: "#00FF88" }
  ]
}
```

### PlayerCard
```typescript
{
  width: "280-320px",
  avatar: { size: 56, ringWidth: 3 },
  hover: { y: -4, shadow: "0 20px 40px" }
}
```

---

**Versão:** 2.0 — Janeiro 2026
