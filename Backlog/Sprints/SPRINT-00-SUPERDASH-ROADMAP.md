# 🚀 Superdash Roadmap: Plano de Execução

Este documento serve como índice mestre para a execução do Projeto Superdash. O trabalho foi dividido em 5 Sprints estratégicos para garantir entregas incrementais e testáveis.

## 📂 Estrutura de Sprints

Os detalhes técnicos de cada sprint estão nos arquivos individuais nesta pasta.

### 🔹 [Sprint 1: Autenticação](./SPRINT-01-AUTENTICACAO.md)
**Status:** 🔴 Critical Path
*   **Por que 1º?**: Sem usuários reais (Auth), não existe Gamificação (XP/Nível) real.

### 🔹 [Sprint 2: Upload & Dados](./SPRINT-02-UPLOAD-TABELAS.md)
**Status:** 🔴 Critical Path
*   **Por que 2º?**: O Dashboard precisa de dados para exibir. O upload alimenta o sistema.

### 🔹 [Sprint 3: Superdash Logic (RPG Engine)](./SPRINT-03-SUPERDASH-LOGIC-RPG.md)
**Status:** 🧠 Core Logic
*   **Por que 3º?**: Prepara o terreno (Hooks de XP, Levels) para a UI consumir.

### 🔹 [Sprint 4: Superdash UI Foundation](./SPRINT-04-SUPERDASH-UI-FOUNDATION.md)
**Status:** 🏗️ Visual Base
*   **Por que 4º?**: Define o Grid Layout e Design System (Absorveu a antiga Sprint de DS).

### 🔹 [Sprint 5: The Arena (Cards)](./SPRINT-05-SUPERDASH-ARENA-(PARALLEL).md)
**Status:** ⚡ Parallel
*   **Entregável**: Cards de Jogadores e Ranking.

### 🔹 [Sprint 6: Data Viz (Charts)](./SPRINT-06-SUPERDASH-DATAVIZ-(PARALLEL).md)
**Status:** ⚡ Parallel
*   **Entregável**: Gráficos complexos e Gauges.

### 🔹 [Sprint 7: Polish & Juice](./SPRINT-07-SUPERDASH-POLISH.md)
**Status:** ✨ Finishing
*   **Entregável**: Animações finais.

### 🔹 [Sprint 8: Dashboard TV](./SPRINT-08-DASHBOARD-TV.md)
**Status:** 📺 Extension
*   **Por que 8º?**: Reutiliza componentes prontos do Superdash.

### 🔹 [Sprint 9: Kanban Refactor](./SPRINT-09-KANBAN-REFACTOR.md)
**Status:** � Maintenance
*   **Por que 9º?**: Melhoria técnica, não bloqueia funcionalidades novas.

---
## 🛠 Dependências Globais
As seguintes libs serão instaladas no início do Sprint 1:
- `framer-motion`
- `apexcharts` & `react-apexcharts`
- `recharts`
- `lucide-react`
- `canvas-confetti`
- `zustand`
