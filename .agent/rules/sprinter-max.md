---
trigger: model_decision
description: Decompõe tarefas complexas em sprints com registro em SPRINTS/. Ative quando a tarefa exigir múltiplas etapas, 3+ arquivos, ou combinações como feature+testes, refatorar+migrar, setup+deploy. Não ative para fixes ou edições pontuais.
---

Sprint Execution Protocol
Princípio Central

Janela de contexto = RAM (volátil, limitada). Filesystem = Disco (persistente, ilimitado).
Toda decisão importante vai para o disco. Nada crítico deve existir só no chat.


Avaliação
A tarefa exige mais de um plano de implementação?
SIM (ativar sprints):

Criar feature + escrever testes
Refatorar arquitetura + migrar dados
Setup de ambiente + implementação + integração
Qualquer tarefa com 3+ etapas lógicas interdependentes

NÃO (executar direto):

Corrigir bug em arquivo único
Responder pergunta
Edição pontual de código
Tarefa completável em uma ação coerente


Pasta SPRINTS/
Crie na raiz do projeto (se não existir):
SPRINTS/TÍTULO DIDÁTICO
├── PLAN.md          ← plano geral (Fase 0)
├── sprint-1.md      ← log do sprint 1
├── sprint-2.md      ← log do sprint 2
├── ...
└── DONE.md          ← relatório final
Esses arquivos são memória persistente. Consulte-os antes de decisões importantes.

Fase 0: Planejamento
Antes de qualquer código, crie SPRINTS/PLAN.md:
markdown# Plano de Execução

**Tarefa:** [resumo em 1 linha]
**Complexidade:** [Baixa | Média | Alta]
**Total de Sprints:** [N]
**Data:** [data atual]

---

### Sprint 1 — [Nome descritivo]
- **Objetivo:** [entrega concreta]
- **Arquivos:** [criar/modificar]
- **Pronto quando:** [critério objetivo]

### Sprint 2 — [Nome descritivo]
- **Objetivo:** ...
- **Arquivos:** ...
- **Pronto quando:** ...
- **Depende de:** Sprint 1

[...]
Apresente o plano no chat. PARE. Aguarde aprovação do usuário.

Fase 1: Execução
Para cada sprint:
Antes de executar
Anuncie no chat:
▶️ SPRINT [N]/[TOTAL] — [Nome]
Objetivo: [objetivo]
Posso prosseguir?
PARE. Aguarde confirmação do usuário.
Durante a execução

Foque APENAS neste sprint — não antecipe código de sprints futuros
Se encontrar problema inesperado, informe o usuário antes de decidir
Antes de decisões importantes, releia SPRINTS/PLAN.md
Se uma ação falhar, a próxima DEVE ser diferente — nunca repita a mesma abordagem

Após executar
Crie SPRINTS/sprint-[N].md:
markdown# Sprint [N] — [Nome]

**Status:** ✅ Concluído | **Data:** [data]

## Entregue
- [lista objetiva do que foi feito]

## Arquivos tocados
- `caminho/arquivo` — [o que mudou]

## Decisões tomadas
| Decisão | Motivo |
|---------|--------|
| [escolha feita] | [por quê] |

## Erros encontrados
| Erro | Tentativa | Resolução |
|------|-----------|-----------|
| [erro] | [N] | [como resolveu] |
Apresente resumo no chat. PARE. Aguarde aprovação para próximo sprint.

Fase 2: Fechamento
Após o último sprint, crie SPRINTS/DONE.md:
markdown# Execução Completa

**Tarefa:** [resumo]
**Sprints:** [N]/[N] concluídos
**Período:** [início] → [fim]

## Entregas
1. Sprint 1 — [entrega]
2. Sprint 2 — [entrega]

## Arquivos criados/modificados
- [lista completa com caminhos]

## Pontos de atenção
- [limitações, decisões importantes, ou itens para revisão manual]

## Próximos passos
- [se aplicável]

Regras

Nunca pule a Fase 0. Plano é obrigatório.
Sempre aguarde aprovação antes e depois de cada sprint.
Um sprint = um foco. Não misture escopos.
Releia PLAN.md antes de decisões. Mantém o objetivo na atenção.
Erros são sprints. Correções ganham sprint próprio.

Se o plano mudar, atualize PLAN.md e avise o usuário.
Nunca repita ação que falhou. Mude a abordagem.
Tudo no disco. Nenhuma decisão crítica vive só no chat.
CompartilharConteúdo