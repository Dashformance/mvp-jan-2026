# Arquitetura completa para sistema de extração de leads B2B com mini CRM

O sistema ideal combina a **API Casa dos Dados** (R$ 0,01/consulta) como fonte primária de dados de CNPJs brasileiros, **Supabase** com Row Level Security para multi-tenancy, e um sistema de filas com **pgmq** para processar 200 leads/semana sem bloqueios. Para um investimento mensal estimado de **R$ 400-800**, é possível construir uma solução que supera ferramentas prontas em custo-benefício para o mercado brasileiro, onde WhatsApp tem **98% de taxa de abertura** contra 27% do email frio.

A Casa dos Dados fornece dados completos de empresas (telefones, emails, sócios, endereço com geolocalização) através de endpoints de busca avançada por CNAE, localização e porte. Combinada com CNPJá para enriquecimento e verificação de emails via Snov.io ou Hunter.io, a stack entrega leads qualificados para cadências multicanal. A taxa de conversão típica de lead para venda no B2B brasileiro é **2-4%**, o que significa que 200 leads/semana podem gerar **4-8 negócios fechados** semanalmente.

---

## API Casa dos Dados oferece acesso completo à base da Receita Federal

A Casa dos Dados é a principal API brasileira para consulta de CNPJs, com acesso a dados da Receita Federal em tempo real. O modelo de preço é **R$ 0,01 por consulta**, com reconsulta do mesmo CNPJ gratuita dentro de 30 dias.

### Endpoints principais para extração de leads

O endpoint mais valioso é o `POST /v5/cnpj/pesquisa` que permite buscas avançadas com múltiplos filtros:

```javascript
// Exemplo de busca por CNAE e região
const response = await fetch('https://api.casadosdados.com.br/v5/cnpj/pesquisa', {
  method: 'POST',
  headers: {
    'api-key': 'SUA_CHAVE_API',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    codigo_atividade_principal: ['6201501'], // Software
    situacao_cadastral: ['ATIVA'],
    uf: ['SP', 'RJ'],
    com_email: true,
    com_telefone: true,
    excluir_mei: true,
    page: 1
  })
});
```

**Filtros disponíveis** incluem CNAE (primário e secundário), UF/município/bairro, DDD, faixa de capital social, data de abertura, tipo (matriz/filial), e flags para filtrar apenas empresas com email ou telefone cadastrado. O endpoint `POST /v5/cnpj/pesquisa/arquivo` permite exportação em massa para arquivos.

### Estrutura de dados retornados

Cada empresa retorna campos essenciais para prospecção B2B:

| Campo | Descrição | Uso para CRM |
|-------|-----------|--------------|
| telefones[] | Array de telefones cadastrados | Ligações/WhatsApp |
| emails[] | Emails da empresa | Cold email |
| quadro_societario[] | Sócios com qualificação | Identificar decisores |
| endereco.latitude/longitude | Geolocalização | Segmentação regional |
| capital_social | Capital declarado | Qualificação por porte |
| atividade_principal | CNAE principal | Segmentação por setor |

### Configuração do MCP Server para desenvolvimento

Para integrar com IDEs que suportam Model Context Protocol (Cursor, VS Code com Cline):

```json
{
  "mcpServers": {
    "Casa dos Dados API": {
      "command": "npx",
      "args": ["-y", "apidog-mcp-server@latest", "--site-id=751164"]
    }
  }
}
```

A plataforma oferece **200 consultas gratuitas** para teste nos primeiros 7 dias, e webhooks (atualmente gratuitos) para receber notificações de novos CNPJs cadastrados.

---

## APIs complementares completam o stack de enriquecimento

A Casa dos Dados nem sempre possui emails de decisores específicos — apenas emails corporativos genéricos cadastrados na Receita. Para encontrar contatos de tomadores de decisão, é necessário combinar múltiplas fontes.

### CNPJá oferece a melhor alternativa para dados complementares

O CNPJá (cnpja.com) funciona como backup e validação, com **50 créditos/mês gratuitos** e planos a partir de R$ 24,99. Sua vantagem é o sistema de cache configurável que reduz custos — usar `CACHE_IF_FRESH` em vez de consultas em tempo real economiza créditos significativamente.

Para descoberta de emails de decisores, as melhores opções são:

- **Snov.io** (a partir de $39/mês): Inclui verificação em 7 camadas, busca por perfil LinkedIn, e funciona bem com domínios .com.br. O plano inicial oferece **1.000 créditos** que cobrem a necessidade de 200 leads/semana
- **Hunter.io** (a partir de $34/mês): Especializado em descoberta de padrões de email (nome@empresa.com.br), com **500 buscas** no plano inicial e taxa de sucesso de 35-45%

### Verificação de emails é essencial para deliverability

Para evitar bounces que prejudicam a reputação do domínio, serviços como **ZeroBounce** ou **Bouncer** verificam emails antes do envio. O custo médio é **$0,008 por verificação** em volumes de 1.000+, representando menos de R$ 100/mês para 200 leads semanais.

Para dados de telefone e WhatsApp, os próprios registros da Casa dos Dados e CNPJá são a melhor fonte. Para integração com WhatsApp Business API, provedores brasileiros como **Zenvia** e **Take Blip** oferecem templates pré-aprovados e compliance com regulamentações locais.

---

## Modelagem de banco de dados no Supabase para multi-tenancy

O schema proposto organiza dados em torno de **organizations** (tenants), **leads**, **companies**, **contacts** e **interactions**, com Row Level Security garantindo isolamento completo entre clientes.

### Schema principal para leads B2B

```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    
    -- Dados da empresa
    company_name TEXT NOT NULL,
    cnpj VARCHAR(18),
    
    -- Decisor
    decision_maker_name TEXT,
    decision_maker_title TEXT,
    
    -- Contato
    email TEXT,
    phone VARCHAR(20),  -- Formato: +55 (11) 99999-9999
    
    -- Status e datas
    status TEXT DEFAULT 'novo' CHECK (status IN (
        'novo', 'tentando_contato', 'respondeu', 
        'reuniao_agendada', 'qualificado', 'descartado'
    )),
    date_added TIMESTAMPTZ DEFAULT NOW(),
    first_contact_date TIMESTAMPTZ,
    last_contact_date TIMESTAMPTZ,
    next_followup_date DATE,
    
    -- Extras
    extra_info JSONB DEFAULT '{}',
    source TEXT,
    tags TEXT[],
    priority INTEGER DEFAULT 0
);

-- Índices críticos para performance
CREATE INDEX idx_leads_org_status ON leads(organization_id, status);
CREATE INDEX idx_leads_org_date ON leads(organization_id, date_added DESC);
```

### Políticas RLS para isolamento de tenants

O padrão mais eficiente usa uma função helper que cacheia o organization_id do usuário:

```sql
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM users WHERE id = (SELECT auth.uid());
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Política para leads
CREATE POLICY "tenant_isolation_leads" ON leads
    FOR ALL TO authenticated
    USING (organization_id = (SELECT get_user_organization_id()))
    WITH CHECK (organization_id = (SELECT get_user_organization_id()));
```

A função `SECURITY DEFINER` com `STABLE` permite que o Postgres otimize a execução, evitando consultas repetidas à tabela users.

---

## Sistema de filas com pgmq processa extrações sem bloqueio

Para extrair 200 leads/semana sem sobrecarregar APIs externas, o sistema usa **filas persistentes** no próprio Postgres via pgmq, com **pg_cron** disparando Edge Functions a cada 30 segundos.

### Arquitetura de rate limiting

```typescript
// lib/ratelimit.ts - Usando Upstash Redis
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const extractionLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(200, '7d'), // 200 por semana
    prefix: 'ratelimit:extraction',
});

// Ao iniciar extração
const { success, remaining } = await extractionLimiter.limit(organizationId);
if (!success) {
    return { error: 'Limite semanal atingido', remaining: 0 };
}
```

### Fluxo de processamento com retry exponencial

```
Usuário → API Route → Verifica limite → Enfileira job (pgmq)
                                              ↓
pg_cron (30s) → Edge Function → Processa job
                                    ↓
                            Casa dos Dados API
                                    ↓
                    Sucesso → Insere leads no Supabase
                    Falha → Backoff exponencial → Retry queue
```

O backoff começa em **1 segundo** e dobra a cada tentativa (2s, 4s, 8s...) até máximo de 60 segundos, com jitter aleatório de 0-1000ms para evitar thundering herd. Após 3 tentativas falhas, o job vai para fila de retry que é processada a cada 5 minutos.

---

## Cadências multicanal maximizam conversão no Brasil

O funil típico B2B brasileiro converte **2-4% dos leads em vendas**, mas WhatsApp como canal principal pode dobrar taxas de resposta comparado a mercados que dependem apenas de email.

### Sequência recomendada de 21 dias

| Dia | Canal | Ação | Taxa esperada |
|-----|-------|------|---------------|
| 1 | Email + LinkedIn | Primeiro contato + conexão | 27% abertura |
| 3 | WhatsApp | Mensagem de texto | **98% abertura, 45-60% resposta** |
| 5 | Ligação | Primeira tentativa + voicemail | 5-16% conexão |
| 7 | Email | Case study com prova social | 5-8% resposta |
| 9 | WhatsApp | Áudio curto de follow-up | Alta resposta |
| 11 | Ligação | Segunda tentativa | - |
| 14 | LinkedIn | Engajamento em posts | - |
| 17 | Email | Conteúdo de valor | - |
| 19 | Ligação | Terceira tentativa | - |
| 21 | Email | "Break-up" email | Última chance |

**Melhores horários**: Email entre 7-11h ou 20-23h (quinta-feira tem maior taxa de resposta a **6,87%**). Ligações entre 16-17h são **71% mais efetivas** que ao meio-dia.

### Modelo de qualificação e scoring

O lead progride através de status definidos: **novo → tentando_contato → respondeu → reunião_agendada → qualificado → oportunidade**. Para classificação em frio/morno/quente:

- **Frio (0-25 pontos)**: Sem engajamento, continuar cadência
- **Morno (26-60 pontos)**: Alguma interação (abriu email, visitou site)
- **Quente (61-100 pontos)**: Respondeu, BANT qualificado, handoff para vendas

Pontuação comportamental: +25 por resposta no WhatsApp, +20 por visita à página de preços, +30 por solicitação de demo, -10 após 14 dias sem resposta.

---

## Análise de build versus buy favorece stack híbrido

Para 200 leads/semana focados no Brasil, construir um mini CRM próprio com integrações é mais vantajoso que pagar por ferramentas enterprise como ZoomInfo ($15.000/ano) ou Apollo.io com dados limitados para LATAM.

### Comparativo de custos mensais

| Componente | Construir | Comprar | Recomendação |
|------------|-----------|---------|--------------|
| Dados de CNPJ | Casa dos Dados ~R$80 | Econodata R$500+ | **Construir** |
| CRM básico | Supabase Free | HubSpot Free | **Empate** |
| Verificação email | Hunter $34 | Snov.io $39 | **Comprar** |
| Cadências | Custom + pg_cron | Meetime R$200+ | **Construir** |
| **Total mensal** | **R$400-600** | **R$1.500+** | - |

### O que construir vs integrar

**Construir** (vantagem competitiva):
- Integração com Casa dos Dados + enrichment pipeline
- Sistema de filas e rate limiting personalizado
- Interface de CRM simplificada no Next.js
- Scoring de leads baseado em ICP específico

**Comprar/Integrar** (commodity):
- Verificação de email (Hunter.io/Snov.io API)
- Envio de email em massa (Resend, SendGrid)
- WhatsApp Business via Zenvia/Twilio
- Analytics básico do Supabase

### Stack técnico final recomendado

```
Frontend: Next.js 14+ (App Router)
Backend: Supabase (Postgres + Auth + Edge Functions)
Filas: pgmq + pg_cron
Rate Limiting: Upstash Redis
APIs Externas: Casa dos Dados + Hunter.io
Deploy: Vercel (com Cron Jobs)
```

---

## Compliance com LGPD exige cuidados específicos

A LGPD não diferencia claramente B2B de B2C — emails com nomes pessoais (joao@empresa.com.br) são dados pessoais protegidos. O fundamento legal mais adequado para prospecção é **legítimo interesse**, desde que exista conexão razoável entre seu serviço e o negócio do prospect.

**Requisitos obrigatórios**: Link de opt-out em todos emails, processamento de descadastro em até 10 dias, identificação clara do remetente, documentação da fonte de cada lead, exclusão de dados mediante solicitação.

**Práticas de deliverability**: Configurar SPF/DKIM/DMARC, usar domínio separado para cold email, aquecer domínio por 2-4 semanas antes de volume, manter bounce rate abaixo de 2% e reclamações de spam abaixo de **0,1%** (novo limite do Gmail 2024).

---

## Conclusão

A arquitetura proposta entrega um sistema de extração e gestão de leads B2B por aproximadamente **R$ 500/mês** em custos de APIs, contra R$ 1.500+ de ferramentas prontas que têm dados inferiores para o mercado brasileiro. O diferencial está na combinação da Casa dos Dados (melhor cobertura de CNPJs) com Supabase (custo zero até escala significativa) e cadências otimizadas para WhatsApp (canal dominante no Brasil).

Para implementação, a sequência recomendada é: primeiro configurar o banco Supabase com RLS, depois integrar a API Casa dos Dados para buscas por CNAE, em seguida adicionar o sistema de filas para processamento assíncrono, e finalmente construir a interface de CRM com gestão de status e lembretes de follow-up. O sistema de 200 leads/semana deve gerar entre **16-32 oportunidades qualificadas por mês** assumindo conversão de 2-4%, tornando o investimento altamente viável para operações de vendas B2B no Brasil.