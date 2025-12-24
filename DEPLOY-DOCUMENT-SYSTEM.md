# Deploy do Sistema de Documentos - aaPanel

## 🎯 Comandos para Executar no Terminal SSH

### 1️⃣ Acessar o Terminal SSH no aaPanel
- Acesse o painel: https://inpacta.org.br:8888
- Menu lateral: **Terminal**
- Ou conecte via SSH: `ssh root@inpacta.org.br`

### 2️⃣ Navegar para o Diretório do Projeto
```bash
cd /www/wwwroot/inpacta.org.br
```

### 3️⃣ Executar a Migração (Criar Tabelas)
```bash
npx prisma migrate dev --name add_document_system
```

**O que isso faz:**
- Cria as tabelas no PostgreSQL:
  - `DocumentArea` (2 registros: Transparência, Licitações)
  - `DocumentCategory` (hierárquica com parent/child)
  - `Document` (documento universal)
  - `Bidding` (processos de licitação)
  - `DocumentVersion` (versionamento)
  - `DocumentHistory` (auditoria)
- Adiciona enums: `DocumentStatus`, `DisplayType`, `BiddingModality`, `BiddingType`, `BiddingStatus`, `HistoryAction`
- Atualiza modelo `User` com relações para documentos

**Saída esperada:**
```
✔ Generated Prisma Client
✔ Migration applied
✅ Migration successful
```

### 4️⃣ Executar o Seed (Popular Categorias)
```bash
npm run db:seed:documents
```

**O que isso faz:**
- Insere **2 áreas** (Transparência, Licitações)
- Insere **12 categorias principais** (6 por área)
- Insere **36 subcategorias** (3 por categoria)
- Total: **48 categorias** prontas para uso

**Estrutura inserida:**

#### Transparência
1. **Institucional** (TABLE)
   - Estatuto Social
   - Regimento Interno
   - Atas de Reunião

2. **Orçamento e Finanças** (TABLE)
   - Orçamento Anual
   - Balancetes
   - Demonstrativos Financeiros

3. **Despesas e Receitas** (TABLE)
   - Despesas Mensais
   - Receitas Mensais
   - Notas Fiscais

4. **Contratos e Convênios** (TABLE)
   - Contratos Vigentes
   - Convênios
   - Termos Aditivos

5. **Relatórios e Prestação de Contas** (TABLE)
   - Relatórios de Gestão
   - Prestação de Contas Anual
   - Relatórios de Auditoria

6. **Acesso à Informação** (PAGE_WITH_DOCS)
   - Carta de Serviços
   - Perguntas Frequentes
   - Formulário de Solicitação

#### Licitações
1. **Avisos e Editais** (CARDS)
   - Avisos de Licitação
   - Editais Publicados
   - Erratas e Aditivos

2. **Licitações em Andamento** (CARDS)
   - Pregão Eletrônico
   - Concorrência
   - Dispensa/Inexigibilidade

3. **Licitações Encerradas** (TABLE)
   - Processos Finalizados
   - Processos Cancelados
   - Processos Desertos

4. **Resultados e Atas** (TABLE)
   - Atas de Julgamento
   - Resultados Homologados
   - Recursos e Decisões

5. **Contratos Firmados** (TABLE)
   - Contratos de Licitações
   - Aditivos Contratuais
   - Rescisões

6. **Planejamento de Compras** (PAGE_WITH_DOCS)
   - Plano Anual de Compras
   - Pesquisas de Preço
   - Justificativas

**Saída esperada:**
```
✅ DocumentArea: Transparência criada
✅ DocumentArea: Licitações criada
✅ 48 categorias inseridas com sucesso!
🎉 Seed executado com sucesso!
```

### 5️⃣ Verificar as Tabelas Criadas (Opcional)
```bash
npx prisma studio
```
- Abre interface web em: http://localhost:5555
- Navegue pelas tabelas para verificar dados

**Ou use SQL direto:**
```bash
psql -U inpacta_user -d inpacta_db -c "SELECT * FROM \"DocumentArea\";"
psql -U inpacta_user -d inpacta_db -c "SELECT name, slug FROM \"DocumentCategory\" WHERE \"parentId\" IS NULL;"
```

---

## 🔍 Solução de Problemas

### Erro: "Environment variable not found: DATABASE_URL"
**Solução:**
```bash
# Verifique se o .env existe
cat .env

# Se não existir, crie:
echo 'DATABASE_URL="postgresql://inpacta_user:sXndkS4mHpaTMzRy@localhost:5432/inpacta_db"' > .env
```

### Erro: "Database does not exist"
**Solução:**
```bash
# Verificar se o banco existe
sudo -u postgres psql -c "\l" | grep inpacta_db

# Se não existir, criar:
sudo -u postgres psql -c "CREATE DATABASE inpacta_db;"
```

### Erro: "Migration already applied"
**Solução:** Tudo certo, a migração já foi executada anteriormente.

### Erro: "Seed failed"
**Solução:**
```bash
# Verificar logs detalhados
npm run db:seed:documents 2>&1 | tee seed-log.txt

# Verificar conectividade com o banco
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('✅ Conectado!')).catch(e => console.error('❌ Erro:', e));"
```

---

## 📋 Checklist de Execução

- [ ] Acessei o terminal SSH do aaPanel
- [ ] Naveguei para `/www/wwwroot/inpacta.org.br`
- [ ] Executei `npx prisma migrate dev --name add_document_system`
- [ ] Migração completada com sucesso
- [ ] Executei `npm run db:seed:documents`
- [ ] Seed completado com 48 categorias
- [ ] Verifiquei dados com `npx prisma studio` (opcional)

---

## 🚀 Próximos Passos Após Deploy

### 1. Build do Next.js
```bash
npm run build
```

### 2. Reiniciar Aplicação (Node Manager no aaPanel)
- Menu: **App Store** → **Node Project Manager**
- Localize: `inpacta.org.br`
- Clique: **Restart**

### 3. Testar em Produção
Acesse: https://inpacta.org.br/api/public/document-areas

**Resposta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "transparencia",
      "name": "Transparência",
      "categories": [...]
    },
    {
      "id": 2,
      "slug": "licitacoes",
      "name": "Licitações",
      "categories": [...]
    }
  ]
}
```

---

## 📊 Status das Tabelas

| Tabela | Registros Esperados | Descrição |
|--------|---------------------|-----------|
| DocumentArea | 2 | Transparência, Licitações |
| DocumentCategory | 48 | 12 principais + 36 subcategorias |
| Document | 0 | Vazio (será populado via admin) |
| Bidding | 0 | Vazio (será populado via admin) |
| DocumentVersion | 0 | Vazio (criado quando doc for versionado) |
| DocumentHistory | 0 | Vazio (criado quando houver ações) |

---

## 🎯 Comando Único (Copiar e Colar)

Se preferir executar tudo de uma vez:

```bash
cd /www/wwwroot/inpacta.org.br && \
npx prisma migrate dev --name add_document_system && \
npm run db:seed:documents && \
npm run build && \
echo "✅ Deploy completo! Reinicie a aplicação no Node Manager."
```

---

## ✅ Validação Final

Execute para confirmar tudo funcionando:

```bash
# Contar categorias
psql -U inpacta_user -d inpacta_db -c "SELECT COUNT(*) FROM \"DocumentCategory\";"
# Resultado esperado: 48

# Listar áreas
psql -U inpacta_user -d inpacta_db -c "SELECT id, slug, name FROM \"DocumentArea\";"
# Resultado esperado:
#  id |     slug      |      name
# ----+---------------+---------------
#   1 | transparencia | Transparência
#   2 | licitacoes    | Licitações
```

**Se ambos os comandos retornarem resultados corretos, o deploy foi um sucesso! 🎉**
