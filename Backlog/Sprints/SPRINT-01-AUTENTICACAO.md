# 🔐 Sprint 1: Sistema de Autenticação

> **Status:** ✅ Concluída  
> **Prioridade:** Alta  
> **Dependências:** Nenhuma

---

## 🎯 Objetivo

Implementar um sistema de login real para que cada usuário tenha sua própria sessão autenticada, substituindo o seletor de usuário temporário atual.

---

## 👥 Usuários Iniciais

| Nome | Email (sugerido) | Perfil |
|------|------------------|--------|
| João Vitor | joao@dashformance.com | Admin |
| Nitz | nitz@dashformance.com | Vendedor |
| Bruno | bruno@dashformance.com | Vendedor |

---

## 📋 Requisitos Funcionais

### RF-01: Tela de Login
- [ ] Design seguindo novo Design System
- [ ] Campos: Email + Senha
- [ ] Opção "Lembrar de mim"
- [ ] Feedback visual de erros
- [ ] Loading state durante autenticação

### RF-02: Autenticação Supabase
- [ ] Configurar Supabase Auth
- [ ] Criar usuários iniciais no Supabase
- [ ] Implementar login via `signInWithPassword`
- [ ] Implementar logout via `signOut`
- [ ] Gerenciar sessão via `onAuthStateChange`

### RF-03: Persistência de Sessão
- [ ] Manter usuário logado entre reloads
- [ ] Redirecionamento automático:
  - `/login` → `/` (se autenticado)
  - `/` → `/login` (se não autenticado)

### RF-04: Integração com CRM
- [ ] Associar leads ao `user_id` do usuário logado
- [ ] Filtrar Kanban por owner = usuário logado
- [ ] Exibir nome/avatar do usuário no Header
- [ ] Dashboard mostrar apenas métricas do usuário (com toggle para "Equipe")

### RF-05: Remoção do Legado
- [ ] Remover componente `UserSelector`
- [ ] Remover lógica de seleção manual de usuário
- [ ] Migrar dados antigos com owner="João" / "Vitor" para novos user_ids

---

## 🏗️ Arquitetura Proposta

```
client/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx        # Tela de login
│   ├── (protected)/
│   │   ├── page.tsx            # Kanban (protegido)
│   │   ├── dashboard/          # Dashboard (protegido)
│   │   └── layout.tsx          # Auth guard wrapper
│   └── layout.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Auth middleware
│   └── auth-context.tsx        # Context de autenticação
└── components/
    └── auth/
        ├── LoginForm.tsx
        └── UserMenu.tsx        # Menu do usuário logado
```

---

## 📊 Modelo de Dados

### Ajustes no Schema Prisma

```prisma
model User {
  id            String   @id @default(uuid())
  supabase_uid  String   @unique  // ← Novo: ID do Supabase Auth
  name          String
  email         String   @unique
  avatar_url    String?            // ← Novo: URL do avatar
  role          String   @default("seller") // admin | seller
  created_at    DateTime @default(now())
  leads         Lead[]   @relation("OwnerRelation")
}

model Lead {
  // ... campos existentes ...
  owner_id      String?  // ← Mudar de owner: String para owner_id
  owner         User?    @relation("OwnerRelation", fields: [owner_id], references: [id])
}
```

---

## ✅ Critérios de Aceite

1. [ ] Usuário consegue fazer login com email/senha
2. [ ] Sessão persiste após fechar e reabrir o navegador
3. [ ] Usuário não autenticado é redirecionado para `/login`
4. [ ] Kanban mostra apenas leads do usuário logado por padrão
5. [ ] Nome do usuário aparece no header
6. [ ] Logout funciona corretamente
7. [ ] UserSelector foi completamente removido

---

## 🧪 Plano de Testes

### Testes Manuais
1. Tentar acessar `/` sem estar logado → deve redirecionar para `/login`
2. Login com credenciais inválidas → deve mostrar erro
3. Login com credenciais válidas → deve redirecionar para Kanban
4. Fechar navegador, abrir novamente → deve manter sessão
5. Click em Logout → deve voltar para `/login`

### Testes Automatizados (Futuro)
- [ ] Teste de integração: fluxo de login
- [ ] Teste de middleware de proteção de rotas
- [ ] Teste de sincronização de sessão

---

## 📝 Notas Adicionais

- Considerar implementar login social (Google) no futuro
- Avaliar necessidade de "Esqueci minha senha"
- PIN como alternativa pode ser implementado após MVP
