# Sprint 3: Logic & RPG Engine (Core)

> **Status:** ✅ Concluída  
> **Prioridade:** Alta  

**Foco:** O "Cérebro" gamificado do sistema. Lógica pura, prioridade máxima antes da UI.

## 🧠 Hook de Gamificação
- [x] Criar `hooks/useGamification.ts`.
- [x] Implementar `calculateLevel(xp)` usando a fórmula exponencial.
- [x] Implementar tabela de XP (`ACTION_POINTS`).
- [x] Implementar `addXP(actionType)` com suporte a multiplicadores.

## 💾 Persistência (Mock/Local)
- [x] Criar Store Zustand (`useGameStore`) para manter estado do usuário.
- [x] Persistir XP e Nível no `localStorage` (para protótipo).

## 🏆 badges System
- [x] Definir constantes de Badges (`BADGES_CONFIG`).
- [x] Criar função `checkBadges(stats)` que roda a cada ação para ver se desbloqueou algo.

## ✅ Critérios de Aceite
- [x] Função `addXP` aumenta o XP total corretamente.
- [x] Nível sobe automaticamente quando XP cruza o limiar.
- [x] Multiplicadores (ex: Combo) funcionam.
