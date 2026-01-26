# 🧹 Sprint 6: Limpeza de Recursos

> **Status:** ✅ Concluída
> **Prioridade:** Baixa  
> **Dependências:** Após sprints críticas

---

## 🎯 Objetivo

Remover recursos não utilizados, features obsoletas e código legado para manter o projeto limpo e focado.

---

## 🗑️ Recursos a Remover

### 1. Funcionalidade "Dividir Leads"

**Localização:**
- `app/api/leads/divide/` - Endpoint API
- `components/` - Botão/modal de divisão (se existir)
- `lib/services/` - Lógica de divisão (se existir)

**Motivo:** Será repensada em versão futura

**Ação:**
- [x] Remover endpoint `/api/leads/divide`
- [x] Remover componentes relacionados
- [x] Remover referências no código
- [x] Atualizar documentação

---

### 2. UserSelector Temporário

**Localização:**
- `components/layout/UserSelector.tsx`

**Motivo:** Será substituído pelo sistema de autenticação real (Sprint 1)

**Ação:**
- [x] Remover após Sprint 1 ser concluída (Arquivo já não existia)
- [x] Substituir por componente de usuário autenticado

---

### 3. Código Morto / Não Utilizado

**Análise Pendente:**
- [x] Executar análise de código não utilizado
- [x] Identificar componentes órfãos
- [x] Listar funções sem chamadas

**Ferramentas:**
```bash
# Buscar exports não utilizados
npx knip

# Ou manualmente
grep -r "export" --include="*.tsx" | grep -v "import"
```

---

### 4. Arquivos de Debug/Teste

**Localização (raiz):**
- `debug-details.js`
- `debug-fields.js`
- `test-api.js`
- `test-construtoras-bc.js`

**Ação:**
- [x] Mover para pasta `scripts/` ou remover se obsoletos

---

### 5. Dependências Não Utilizadas

**Análise:**
```bash
npx depcheck
```

**Ação:**
- [x] Listar dependências não utilizadas
- [x] Remover do `package.json`
- [x] Testar se build continua funcionando

---

## 📋 Checklist de Limpeza

### Código
- [ ] Remover console.logs de desenvolvimento
- [ ] Remover comentários TODO antigos
- [ ] Remover imports não utilizados
- [ ] Remover variáveis não utilizadas

### Arquivos
- [x] Remover arquivos `.bak`
- [x] Remover arquivos temporários
- [x] Organizar scripts em pasta dedicada

### Configurações
- [ ] Revisar `.env.example`
- [ ] Remover variáveis não utilizadas
- [ ] Atualizar `.gitignore` se necessário

---

## ✅ Critérios de Aceite

1. [x] Funcionalidade "Dividir Leads" removida
2. [x] Nenhum arquivo órfão no projeto (Cleaned up scripts)
3. [x] Build passa sem erros
4. [x] Nenhum warning de lint
5. [x] Docs atualizadas

---

## 🧪 Plano de Testes

### Após Cada Remoção
1. Executar build: `npm run build`
2. Verificar lint: `npm run lint`
3. Testar app manualmente
4. Verificar console por erros

---

## 📝 Notas

Esta sprint pode ser executada incrementalmente, removendo um recurso por vez para minimizar riscos de quebra.
