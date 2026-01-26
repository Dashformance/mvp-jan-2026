# Sprint 04: Design System v2.0 Foundation 🎨

> **Objetivo:** Aplicar a nova identidade visual (Dark Glassmorphism + Champagne) em todos os componentes base.  
> **Duração Estimada:** 3-5 dias  
> **Prioridade:** Alta (Bloqueia Sprint 05)

---

## 📋 Escopo

### Fase 1: Tokens CSS (`globals.css`)
- [ ] Atualizar paleta de fundos (--bg-void a --bg-active)
- [ ] Configurar cores Champagne (--accent, --accent-muted, --accent-glow)
- [ ] Adicionar cores Neon funcionais (green, yellow, orange, red, cyan, purple)
- [ ] Adicionar cores de Rank (bronze → icon)
- [ ] Configurar tipografia (Inter + Space Grotesk + JetBrains Mono)
- [ ] Adicionar variáveis de animação e easings
- [ ] Criar utilitários (.glass, .glass-hover, .font-display, .glow-*)

### Fase 2: Componentes Atômicos
- [ ] `button.tsx` — variants: primary, secondary, ghost, destructive, xp
- [ ] `badge.tsx` — status + ranks (bronze/silver/gold/platinum/diamond) + xp
- [ ] `input.tsx` — focus champagne, estados error/success
- [ ] `checkbox.tsx` / `radio-group.tsx` — indicadores neon
- [ ] `slider.tsx` — thumb com glow
- [ ] `progress.tsx` — XP bar com gradiente
- [ ] `label.tsx` — tipografia uppercase

### Fase 3: Componentes Containers
- [ ] `card.tsx` — variants: default, glass, game
- [ ] `dialog.tsx` — overlay blur, borda glass
- [ ] `sheet.tsx` — painel lateral com sombra
- [ ] `popover.tsx` / `dropdown-menu.tsx` — backdrop-blur
- [ ] `tabs.tsx` — indicador neon
- [ ] `table.tsx` — headers glass, hovers sutis
- [ ] `accordion.tsx` — bordas sutis

### Fase 4: Componentes de Negócio (CRM)
- [ ] Kanban Cards — score border, hover lift
- [ ] Kanban Columns — drop zone accent
- [ ] Lead Sheet — seções com glass

---

## 🎨 Referências Visuais

- **Paleta:** Dark (#0A0A0A) + Champagne (#DECCA8) + Neon funcional
- **Glassmorphism:** `backdrop-blur: 12px` + `rgba(255,255,255,0.03)`
- **Bordas:** `rgba(255,255,255,0.08)` padrão
- **Tipografia números:** Space Grotesk (font-display)

---

## ✅ Critérios de Aceite

1. Build sem erros (`npm run build`)
2. Todos os componentes usando tokens CSS (não cores hardcoded)
3. Consistência visual em todas as páginas
4. Hover/focus states funcionando
5. Space Grotesk aplicado em números/KPIs

---

## 📁 Arquivos Principais

```
client/
├── app/globals.css          # Tokens CSS
├── components/ui/           # Todos componentes Radix/Shadcn
│   ├── button.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── sheet.tsx
│   ├── progress.tsx
│   ├── tabs.tsx
│   ├── table.tsx
│   └── ...
└── components/kanban/       # Cards e colunas
```

---

**Status:** 🟡 Aguardando início  
**Dependências:** Nenhuma  
**Bloqueia:** Sprint 05 (Superdash Premium)
