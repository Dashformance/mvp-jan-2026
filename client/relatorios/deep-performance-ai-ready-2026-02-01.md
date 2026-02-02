# 📊 RELATÓRIO DE PERFORMANCE DEEP-DIVE (AI READY)
**Período de Análise:** 24/01/2026 até 31/01/2026
**Data de Geração:** 31/01/2026, 21:07:37

---

## 1. MÉTRICAS EXECUTIVAS (KPIs)
| Métrica | Valor Atual | Var. Semanal | Impacto Financeiro (BRL) |
| :--- | :--- | :--- | :--- |
| **Novos Leads (Inbound/Manual)** | 82 | +8100.0% | -- |
| **Volume de Atividade (Mensagens)** | 124 | +1671.4% | -- |
| **Sucesso em Abordagem (Respostas)** | 39 | +1850.0% | -- |
| **Qualificação (Reuniões)** | 11 | +175.0% | -- |
| **Conversão Final (Fechamentos)** | 1 | -66.7% | R$ 24.000 |
| **Pipeline Total Ativo** | 134 | -- | R$ 36.000 |

---

## 2. FUNIL DE CONVERSÃO UNITÁRIO (EFICIÊNCIA)
- **Taxa de Resposta (Sent -> Resp):** 31.5%
- **Taxa de Agendamento (Resp -> Meet):** 28.2%
- **Taxa de Fechamento (Meet -> Won):** 9.1%
- **Mensagens p/ fechar 1 venda:** 124.0

---

## 3. DESEMPENHO INDIVIDUAL & GAMIFICAÇÃO
| Colaborador | XP Total | Nível | Leads Add | Msgs | Reuniões | Fech. | Conv. % |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Bruno | 4540 | 5 | 20 | 60 | 5 | 0 | 45.0% |
| João Vitor | 2570 | 4 | 7 | 20 | 2 | 1 | 20.0% |
| vitor | 700 | 2 | 18 | 0 | 1 | 0 | 0% |

---

## 4. ANÁLISE DE ESTOQUE E PIPELINE (SNAPSHOT)
| Status do Lead | Quantidade | Percentual |
| :--- | :--- | :--- |
| ATTEMPTED | 48 | 18.0% |
| CONTACTED | 46 | 17.3% |
| DISQUALIFIED | 37 | 13.9% |
| WON | 2 | 0.8% |
| INBOX | 95 | 35.7% |
| MEETING | 9 | 3.4% |
| NEW | 29 | 10.9% |

---

## 5. DISTRIBUIÇÃO POR SEGMENTO (VALOR POTENCIAL)
| ID Segmento | Qtd Leads | Valor Estimado (BRL) |
| :--- | :--- | :--- |
| Indefinido | 266 | R$ 36.000 |

---

## 6. INSIGHTS PARA IA (SUMMARY PARA AVALIAÇÃO)
1. **Velocidade de Resposta:** O volume de leads adicionados (82) comparado à taxa de resposta (47.6%) indica que a primeira abordagem está com eficiência de conversão para "Contato Realizado" de 31.5%.
2. **Equilíbrio de Carga:** A distribuição de leads entre colaboradores está DESEQUILIBRADA.
3. **Monetização:** O pipeline possui R$ 36.000 em potencial, com uma taxa de conversão de reunião para fechamento de 9.1% esta semana.

---
## DATA DUMP (JSON FOR MACHINE PARSING)
```json
{
  "period": {
    "start": "2026-01-24T03:00:00.000Z",
    "end": "2026-02-01T00:07:37.249Z"
  },
  "global": {
    "leadsAdded": 82,
    "msgSent": 124,
    "calls": 11,
    "notes": 0,
    "responded": 39,
    "meetings": 11,
    "won": 1,
    "wonRevenue": 24000,
    "pipelineRevenue": 36000
  },
  "users": [
    {
      "id": "0184fc53-a696-4ed6-b5e4-2391fd21b902",
      "name": "Bruno",
      "stats": {
        "leadsAdded": 20,
        "msgSent": 60,
        "calls": 0,
        "notes": 0,
        "responded": 27,
        "meetings": 5,
        "won": 0,
        "wonRevenue": 0,
        "pipelineRevenue": 0
      }
    },
    {
      "id": "21d216a4-e8c9-464d-b486-0b4db827f5ba",
      "name": "João Vitor",
      "stats": {
        "leadsAdded": 7,
        "msgSent": 20,
        "calls": 0,
        "notes": 0,
        "responded": 4,
        "meetings": 2,
        "won": 1,
        "wonRevenue": 24000,
        "pipelineRevenue": 24000
      }
    },
    {
      "id": "0eabdccd-e490-4e2c-a862-7f61fa576906",
      "name": "vitor",
      "stats": {
        "leadsAdded": 18,
        "msgSent": 0,
        "calls": 0,
        "notes": 0,
        "responded": 0,
        "meetings": 1,
        "won": 0,
        "wonRevenue": 0,
        "pipelineRevenue": 12000
      }
    }
  ],
  "pipeline": [
    {
      "_count": {
        "id": 48
      },
      "status": "ATTEMPTED"
    },
    {
      "_count": {
        "id": 46
      },
      "status": "CONTACTED"
    },
    {
      "_count": {
        "id": 37
      },
      "status": "DISQUALIFIED"
    },
    {
      "_count": {
        "id": 2
      },
      "status": "WON"
    },
    {
      "_count": {
        "id": 95
      },
      "status": "INBOX"
    },
    {
      "_count": {
        "id": 9
      },
      "status": "MEETING"
    },
    {
      "_count": {
        "id": 29
      },
      "status": "NEW"
    }
  ],
  "segments": [
    {
      "_count": {
        "id": 266
      },
      "_sum": {
        "contract_value": "36000"
      },
      "segment_id": null
    }
  ]
}
```

---
*Gerado por Antigravity v3.0 - Dashformance Ecosystem*
