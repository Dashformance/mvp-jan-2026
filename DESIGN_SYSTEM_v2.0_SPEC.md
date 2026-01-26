# 💎 Superdash Design System v2.0 (Em Elaboração)

> **Objetivo:** Evoluir o visual do Dashformance para uma estética de alto nível, fugindo de cores neon saturadas e focando em um visual sofisticado, escuro e "high-tech" (Cyber-Luxury).

---

## 1. Mapeamento de Componentes (Audit)

Atualmente, os seguintes componentes compõem a biblioteca base:

| Grupo | Componentes |
|-------|-------------|
| **Atômicos** | `Button`, `Input`, `Checkbox`, `RadioGroup`, `Label`, `Badge`, `Slider` |
| **Containers** | `Card`, `GlassCard`, `PageHeader`, `Accordion`, `Tabs` |
| **Overlays** | `Dialog`, `Sheet`, `Popover`, `DropdownMenu`, `Toaster` (Sonner) |
| **Dados** | `Table`, `LeadsTable` (Business), `ArenaGrid` (Business) |

---

## 2. Nova Proposta Visual (A Definir)

### 🎨 Paleta de Cores (Direcionamento)
- **Base:** Em vez de `#050505` (Void), usar tons de **Midnight Slate** (`#0B0E14`) ou **Deep Obsidian**.
- **Destaque (Primária):** Abandonar o Emerald saturado. Proposta: **Titanium Blue** ou **Electric Violet Muted**.
- **Superfícies:** Uso mais contido de Glassmorphism, focando em bordas ultra-finas e gradientes de profundidade.

### ✍️ Tipografia
- Proposta: Manter **Inter** para interface, mas considerar **Geist** ou **Outfit** para um ar mais moderno.

---

## 3. Tokens Globais (Atual vs Novo)

| Token | Atual (Superdash v1.0) | Futuro (v2.0) |
|-------|-----------------------|---------------|
| `--bg-void` | `#050505` | *TBD (A definir)* |
| `--primary` | `#00FF94` (Neon) | *TBD (A definir)* |
| `--border` | `white/8` | *TBD (A definir)* |

---

## 🚀 Próxima Etapa: Sprint de Redesign Completo
1. Definir a cor primária final com o usuário.
2. Re-gerar todos os tokens CSS.
3. Atualizar as variantes de todos os componentes UI em massa.
