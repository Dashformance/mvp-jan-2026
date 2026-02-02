# 🛡️ Relatório Consolidado de Performance & Observabilidade
**Período:** 24/01/2026 a 31/01/2026
**Status do Sistema:** Operacional | **Score de Saúde:** 80/100

---

## 1. VISÃO GERAL (SNAPSHOT DINÂMICO)
*Este painel mapeia o seu Kanban atual para uma estrutura de 'Steps' auditável.*

| Step | Nome da Coluna (Kanban) | Qtd Leads | Valor Estimado |
| :--- | :--- | :--- | :--- |
| **Step 0** | ❄️ Lista Fria | 95 | R$ 0 |
| **Step 1** | ✅ Qualificado | 29 | R$ 0 |
| **Step 2** | Mensagem enviada | 48 | R$ 12.000 |
| **Step 3** | Mensagem respondida | 46 | R$ 0 |
| **Step 4** | 📅 Reunião | 9 | R$ 0 |
| **Step 5** | 💰 Fechamento | 2 | R$ 24.000 |
| **Step 6** | 🔻 Perdido | 0 | R$ 0 |
| **Step 7** | 🚫 Desqualificado | 37 | R$ 0 |
| **Step 8** | Na geladeira. | 0 | R$ 0 |
| **Step 9** | ENVIAR_EMAIL | 0 | R$ 0 |

---

## 2. PERFORMANCE POR COLABORADOR (ATIVIDADES & FLOW)
| Colaborador | Atividade Semanal (Auda) | Movimentações Realizadas | Leads Adicionados |
| :--- | :--- | :--- | :--- |
| Bruno | 61 interações | 94 moves | 20 novos |
| João Vitor | 22 interações | 33 moves | 7 novos |
| vitor | 1 interações | 19 moves | 18 novos |

---

## 3. DIAGNÓSTICO E INSIGHTS (CIÊNCIA DE DADOS)
- 🚨 ALERTA DE CARGA: Há 95 leads aguardando triagem no Inbox. Isso indica um gargalo no início do processo.
- 📈 EFICIÊNCIA: A conversão de movimentações para Reunião está em 4.2% nesta semana.

### Recomendações Estratégicas:
- **Observabilidade**: O colaborador com maior volume de leads no Step 0/1 deve receber suporte para triagem.
- **Performance**: Focar na conversão de Step 3 -> Step 4 (Reunião) para garantir previsibilidade de receita.

---

## 4. DETALHAMENTO TÉCNICO PARA IA
```json
{
  "architecture": "Step-Based Dynamic Mapping",
  "mapping": {
    "INBOX": {
      "status": "INBOX",
      "step": 0,
      "label": "❄️ Lista Fria",
      "phase": "❄️ Lista Fria"
    },
    "NEW": {
      "status": "NEW",
      "step": 1,
      "label": "✅ Qualificado",
      "phase": "✅ Qualificado"
    },
    "ATTEMPTED": {
      "status": "ATTEMPTED",
      "step": 2,
      "label": "Mensagem enviada",
      "phase": "Mensagem enviada"
    },
    "CONTACTED": {
      "status": "CONTACTED",
      "step": 3,
      "label": "Mensagem respondida",
      "phase": "Mensagem respondida"
    },
    "MEETING": {
      "status": "MEETING",
      "step": 4,
      "label": "📅 Reunião",
      "phase": "📅 Reunião"
    },
    "WON": {
      "status": "WON",
      "step": 5,
      "label": "💰 Fechamento",
      "phase": "💰 Fechamento"
    },
    "LOST": {
      "status": "LOST",
      "step": 6,
      "label": "🔻 Perdido",
      "phase": "🔻 Perdido"
    },
    "DISQUALIFIED": {
      "status": "DISQUALIFIED",
      "step": 7,
      "label": "🚫 Desqualificado",
      "phase": "🚫 Desqualificado"
    },
    "INTERESSADO!": {
      "status": "INTERESSADO!",
      "step": 8,
      "label": "Na geladeira.",
      "phase": "Na geladeira."
    },
    "ENVIAR_EMAIL": {
      "status": "ENVIAR_EMAIL",
      "step": 9,
      "label": "ENVIAR_EMAIL",
      "phase": ""
    }
  },
  "global_kpis": {
    "total_activities": 139,
    "total_moves": 169,
    "health_score": 80
  },
  "collaborator_deep_dive": [
    {
      "user": "Bruno",
      "data": {
        "period": {
          "start": "2026-01-25T01:21:45.393Z",
          "end": "2026-02-01T01:21:45.393Z"
        },
        "mapping": {
          "INBOX": {
            "status": "INBOX",
            "step": 0,
            "label": "❄️ Lista Fria",
            "phase": "❄️ Lista Fria"
          },
          "NEW": {
            "status": "NEW",
            "step": 1,
            "label": "✅ Qualificado",
            "phase": "✅ Qualificado"
          },
          "ATTEMPTED": {
            "status": "ATTEMPTED",
            "step": 2,
            "label": "Mensagem enviada",
            "phase": "Mensagem enviada"
          },
          "CONTACTED": {
            "status": "CONTACTED",
            "step": 3,
            "label": "Mensagem respondida",
            "phase": "Mensagem respondida"
          },
          "MEETING": {
            "status": "MEETING",
            "step": 4,
            "label": "📅 Reunião",
            "phase": "📅 Reunião"
          },
          "WON": {
            "status": "WON",
            "step": 5,
            "label": "💰 Fechamento",
            "phase": "💰 Fechamento"
          },
          "LOST": {
            "status": "LOST",
            "step": 6,
            "label": "🔻 Perdido",
            "phase": "🔻 Perdido"
          },
          "DISQUALIFIED": {
            "status": "DISQUALIFIED",
            "step": 7,
            "label": "🚫 Desqualificado",
            "phase": "🚫 Desqualificado"
          },
          "INTERESSADO!": {
            "status": "INTERESSADO!",
            "step": 8,
            "label": "Na geladeira.",
            "phase": "Na geladeira."
          },
          "ENVIAR_EMAIL": {
            "status": "ENVIAR_EMAIL",
            "step": 9,
            "label": "ENVIAR_EMAIL",
            "phase": ""
          }
        },
        "snapshot": {
          "0": {
            "count": 0,
            "value": 0,
            "label": "❄️ Lista Fria"
          },
          "1": {
            "count": 2,
            "value": 0,
            "label": "✅ Qualificado"
          },
          "2": {
            "count": 5,
            "value": 0,
            "label": "Mensagem enviada"
          },
          "3": {
            "count": 9,
            "value": 0,
            "label": "Mensagem respondida"
          },
          "4": {
            "count": 4,
            "value": 0,
            "label": "📅 Reunião"
          },
          "5": {
            "count": 0,
            "value": 0,
            "label": "💰 Fechamento"
          },
          "6": {
            "count": 0,
            "value": 0,
            "label": "🔻 Perdido"
          },
          "7": {
            "count": 2,
            "value": 0,
            "label": "🚫 Desqualificado"
          },
          "8": {
            "count": 0,
            "value": 0,
            "label": "Na geladeira."
          },
          "9": {
            "count": 0,
            "value": 0,
            "label": "ENVIAR_EMAIL"
          }
        },
        "flow": {
          "forward": 0,
          "backward": 0,
          "conversions": 94,
          "stepTransitions": [
            {
              "date": "2026-01-26T15:27:53.520Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:27:55.073Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:27:56.468Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:27:59.448Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:27:59.557Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:28:03.116Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:28:03.458Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:28:10.400Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:28:12.089Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:28:13.806Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:28:15.502Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:28:17.064Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:28:18.866Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:28:20.364Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:28:22.721Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T15:28:24.562Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T17:04:40.777Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T17:08:37.716Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T17:08:41.250Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T17:10:25.294Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T17:23:36.055Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T17:24:07.556Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T17:25:28.055Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T17:27:28.188Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T17:29:03.525Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T17:30:42.657Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T17:37:26.474Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T17:48:23.158Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T17:48:28.438Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T18:34:01.079Z",
              "toStep": 4,
              "label": "📅 Reunião",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T18:39:07.097Z",
              "toStep": 4,
              "label": "📅 Reunião",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T18:55:43.426Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T18:57:35.469Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T18:59:36.820Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-26T19:01:48.068Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T13:54:27.773Z",
              "toStep": 7,
              "label": "🚫 Desqualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:02:57.037Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:04:08.159Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:05:19.643Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:07:28.850Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:08:12.943Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:09:13.965Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:10:26.088Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:11:19.784Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:22:53.715Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:34:03.199Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:34:54.874Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:34:58.102Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:38:10.233Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:38:55.672Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T14:45:50.369Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T15:11:07.043Z",
              "toStep": 7,
              "label": "🚫 Desqualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T15:22:57.074Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T15:22:57.322Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T15:23:02.160Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T15:23:09.373Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T15:34:40.161Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T15:34:53.215Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-27T17:37:28.429Z",
              "toStep": 7,
              "label": "🚫 Desqualificado",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-28T13:47:13.931Z",
              "toStep": 4,
              "label": "📅 Reunião",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-28T14:34:47.924Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-28T14:35:49.802Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-28T14:36:35.191Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-28T14:37:45.166Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-28T14:39:23.947Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-28T14:40:33.573Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T16:00:57.145Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T16:02:30.615Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T16:02:34.185Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T16:02:53.500Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T16:03:28.703Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T18:03:33.782Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T19:09:45.220Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T19:14:06.944Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T19:21:14.280Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T19:21:25.600Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T19:30:28.931Z",
              "toStep": 4,
              "label": "📅 Reunião",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T19:30:44.065Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T19:31:01.896Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T19:31:13.960Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T19:31:20.495Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T19:33:14.539Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-29T19:36:03.816Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-31T23:23:39.358Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-31T23:23:46.107Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-31T23:24:27.779Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-31T23:24:38.005Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-31T23:27:51.958Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-31T23:28:13.148Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-31T23:29:34.094Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-31T23:30:32.348Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-31T23:30:52.627Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-31T23:30:55.892Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            },
            {
              "date": "2026-01-31T23:32:57.320Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0184fc53-a696-4ed6-b5e4-2391fd21b902"
            }
          ]
        },
        "activities": 61
      }
    },
    {
      "user": "João Vitor",
      "data": {
        "period": {
          "start": "2026-01-25T01:21:45.393Z",
          "end": "2026-02-01T01:21:45.393Z"
        },
        "mapping": {
          "INBOX": {
            "status": "INBOX",
            "step": 0,
            "label": "❄️ Lista Fria",
            "phase": "❄️ Lista Fria"
          },
          "NEW": {
            "status": "NEW",
            "step": 1,
            "label": "✅ Qualificado",
            "phase": "✅ Qualificado"
          },
          "ATTEMPTED": {
            "status": "ATTEMPTED",
            "step": 2,
            "label": "Mensagem enviada",
            "phase": "Mensagem enviada"
          },
          "CONTACTED": {
            "status": "CONTACTED",
            "step": 3,
            "label": "Mensagem respondida",
            "phase": "Mensagem respondida"
          },
          "MEETING": {
            "status": "MEETING",
            "step": 4,
            "label": "📅 Reunião",
            "phase": "📅 Reunião"
          },
          "WON": {
            "status": "WON",
            "step": 5,
            "label": "💰 Fechamento",
            "phase": "💰 Fechamento"
          },
          "LOST": {
            "status": "LOST",
            "step": 6,
            "label": "🔻 Perdido",
            "phase": "🔻 Perdido"
          },
          "DISQUALIFIED": {
            "status": "DISQUALIFIED",
            "step": 7,
            "label": "🚫 Desqualificado",
            "phase": "🚫 Desqualificado"
          },
          "INTERESSADO!": {
            "status": "INTERESSADO!",
            "step": 8,
            "label": "Na geladeira.",
            "phase": "Na geladeira."
          },
          "ENVIAR_EMAIL": {
            "status": "ENVIAR_EMAIL",
            "step": 9,
            "label": "ENVIAR_EMAIL",
            "phase": ""
          }
        },
        "snapshot": {
          "0": {
            "count": 56,
            "value": 0,
            "label": "❄️ Lista Fria"
          },
          "1": {
            "count": 24,
            "value": 0,
            "label": "✅ Qualificado"
          },
          "2": {
            "count": 12,
            "value": 0,
            "label": "Mensagem enviada"
          },
          "3": {
            "count": 16,
            "value": 0,
            "label": "Mensagem respondida"
          },
          "4": {
            "count": 2,
            "value": 0,
            "label": "📅 Reunião"
          },
          "5": {
            "count": 2,
            "value": 24000,
            "label": "💰 Fechamento"
          },
          "6": {
            "count": 0,
            "value": 0,
            "label": "🔻 Perdido"
          },
          "7": {
            "count": 1,
            "value": 0,
            "label": "🚫 Desqualificado"
          },
          "8": {
            "count": 0,
            "value": 0,
            "label": "Na geladeira."
          },
          "9": {
            "count": 0,
            "value": 0,
            "label": "ENVIAR_EMAIL"
          }
        },
        "flow": {
          "forward": 0,
          "backward": 0,
          "conversions": 33,
          "stepTransitions": [
            {
              "date": "2026-01-26T12:58:39.252Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-26T15:28:03.645Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-26T16:31:27.811Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-26T16:31:29.566Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-26T16:53:56.311Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-26T17:02:09.293Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-26T17:04:28.232Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-26T17:08:06.157Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-26T17:12:01.106Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-26T17:18:26.423Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-26T17:19:52.386Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-26T19:49:46.009Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-28T19:31:52.911Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-28T19:32:11.548Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-28T19:32:52.207Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-28T19:33:18.328Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-28T19:34:07.185Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-28T19:34:41.790Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-28T19:35:07.842Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-28T19:35:38.318Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-28T19:35:52.069Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-28T19:36:05.086Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-28T19:36:30.324Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-28T19:36:43.434Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-28T19:36:58.509Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-29T18:20:50.749Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-29T19:11:13.911Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-29T19:11:17.220Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-29T19:16:07.897Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-29T19:16:21.603Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-31T19:45:04.110Z",
              "toStep": 3,
              "label": "Mensagem respondida",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-31T19:47:12.576Z",
              "toStep": 5,
              "label": "💰 Fechamento",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            },
            {
              "date": "2026-01-31T19:48:16.608Z",
              "toStep": 7,
              "label": "🚫 Desqualificado",
              "userId": "21d216a4-e8c9-464d-b486-0b4db827f5ba"
            }
          ]
        },
        "activities": 22
      }
    },
    {
      "user": "vitor",
      "data": {
        "period": {
          "start": "2026-01-25T01:21:45.393Z",
          "end": "2026-02-01T01:21:45.393Z"
        },
        "mapping": {
          "INBOX": {
            "status": "INBOX",
            "step": 0,
            "label": "❄️ Lista Fria",
            "phase": "❄️ Lista Fria"
          },
          "NEW": {
            "status": "NEW",
            "step": 1,
            "label": "✅ Qualificado",
            "phase": "✅ Qualificado"
          },
          "ATTEMPTED": {
            "status": "ATTEMPTED",
            "step": 2,
            "label": "Mensagem enviada",
            "phase": "Mensagem enviada"
          },
          "CONTACTED": {
            "status": "CONTACTED",
            "step": 3,
            "label": "Mensagem respondida",
            "phase": "Mensagem respondida"
          },
          "MEETING": {
            "status": "MEETING",
            "step": 4,
            "label": "📅 Reunião",
            "phase": "📅 Reunião"
          },
          "WON": {
            "status": "WON",
            "step": 5,
            "label": "💰 Fechamento",
            "phase": "💰 Fechamento"
          },
          "LOST": {
            "status": "LOST",
            "step": 6,
            "label": "🔻 Perdido",
            "phase": "🔻 Perdido"
          },
          "DISQUALIFIED": {
            "status": "DISQUALIFIED",
            "step": 7,
            "label": "🚫 Desqualificado",
            "phase": "🚫 Desqualificado"
          },
          "INTERESSADO!": {
            "status": "INTERESSADO!",
            "step": 8,
            "label": "Na geladeira.",
            "phase": "Na geladeira."
          },
          "ENVIAR_EMAIL": {
            "status": "ENVIAR_EMAIL",
            "step": 9,
            "label": "ENVIAR_EMAIL",
            "phase": ""
          }
        },
        "snapshot": {
          "0": {
            "count": 39,
            "value": 0,
            "label": "❄️ Lista Fria"
          },
          "1": {
            "count": 0,
            "value": 0,
            "label": "✅ Qualificado"
          },
          "2": {
            "count": 14,
            "value": 12000,
            "label": "Mensagem enviada"
          },
          "3": {
            "count": 5,
            "value": 0,
            "label": "Mensagem respondida"
          },
          "4": {
            "count": 2,
            "value": 0,
            "label": "📅 Reunião"
          },
          "5": {
            "count": 0,
            "value": 0,
            "label": "💰 Fechamento"
          },
          "6": {
            "count": 0,
            "value": 0,
            "label": "🔻 Perdido"
          },
          "7": {
            "count": 32,
            "value": 0,
            "label": "🚫 Desqualificado"
          },
          "8": {
            "count": 0,
            "value": 0,
            "label": "Na geladeira."
          },
          "9": {
            "count": 0,
            "value": 0,
            "label": "ENVIAR_EMAIL"
          }
        },
        "flow": {
          "forward": 0,
          "backward": 0,
          "conversions": 19,
          "stepTransitions": [
            {
              "date": "2026-01-26T16:32:00.976Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-26T16:32:08.940Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-26T16:34:03.971Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-26T16:34:05.885Z",
              "toStep": 7,
              "label": "🚫 Desqualificado",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-26T16:34:07.109Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-26T16:48:11.405Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-26T16:48:13.454Z",
              "toStep": 1,
              "label": "✅ Qualificado",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-26T17:09:15.810Z",
              "toStep": 0,
              "label": "❄️ Lista Fria",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-27T17:59:12.612Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-27T18:24:07.789Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-27T18:31:41.321Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-27T18:41:35.454Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-27T18:41:47.400Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-27T18:47:41.783Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-27T18:48:47.700Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-27T19:04:47.481Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-27T19:05:37.535Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-27T19:06:18.019Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            },
            {
              "date": "2026-01-27T19:15:12.255Z",
              "toStep": 2,
              "label": "Mensagem enviada",
              "userId": "0eabdccd-e490-4e2c-a862-7f61fa576906"
            }
          ]
        },
        "activities": 1
      }
    }
  ]
}
```

---
*Relatório de Missão Crítica - Gerado por Antigravity*
