# Arquitetura do Sistema de Documentos

## 🎯 Visão Geral

Sistema unificado de gestão e publicação de documentos públicos para o portal da INPACTA, com foco em **Transparência** e **Licitações**.

### Conceito Central

**Documento Universal** com metadados que definem onde e como ele aparece no site.

```
Menu ≠ Páginas fixas
Menu = Filtros semânticos sobre documentos
```

---

## 📊 Modelo de Dados

### Entidades Principais

#### 1. Document (Documento Universal)
```prisma
model Document {
  id              String    @id @default(cuid())
  
  // Informações básicas
  title           String
  description     String?   @db.Text
  fileName        String    // Nome original do arquivo
  filePath        String    // Caminho no storage
  fileSize        Int       // Em bytes
  fileType        String    // PDF, DOCX, XLSX, etc
  
  // Classificação (menu semântico)
  area            DocumentArea      // Transparência | Licitação
  category        String            // Relatórios, Editais, Contratos...
  subcategory     String?           // Financeiro, Institucional...
  
  // Temporal
  year            Int               // Ano de referência
  publishedAt     DateTime?         // Data de publicação
  referenceDate   DateTime?         // Data de referência do documento
  
  // Status e controle
  status          DocumentStatus    @default(DRAFT)
  version         Int               @default(1)
  
  // Relações
  areaId          String?
  categoryId      String?
  bidding         Bidding?          @relation(fields: [biddingId], references: [id])
  biddingId       String?
  
  // Auditoria
  createdBy       User              @relation("DocumentCreatedBy", fields: [createdById], references: [id])
  createdById     String
  updatedBy       User?             @relation("DocumentUpdatedBy", fields: [updatedById], references: [id])
  updatedById     String?
  approvedBy      User?             @relation("DocumentApprovedBy", fields: [approvedById], references: [id])
  approvedById    String?
  approvedAt      DateTime?
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  // Histórico
  versions        DocumentVersion[]
  history         DocumentHistory[]
  
  @@index([area, category, status])
  @@index([biddingId])
  @@index([year, publishedAt])
}

enum DocumentArea {
  TRANSPARENCIA   // Transparência
  LICITACAO       // Licitações
}

enum DocumentStatus {
  DRAFT           // Rascunho
  PENDING         // Pendente aprovação
  PUBLISHED       // Publicado
  ARCHIVED        // Arquivado
}
```

#### 2. DocumentCategory (Categorias Configuráveis)
```prisma
model DocumentCategory {
  id              String    @id @default(cuid())
  
  name            String    // "Relatórios e Prestação de Contas"
  slug            String    @unique // "relatorios-prestacao-contas"
  description     String?   @db.Text
  
  area            DocumentArea
  
  // Hierarquia
  parent          DocumentCategory? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  parentId        String?
  children        DocumentCategory[] @relation("CategoryHierarchy")
  
  // Ordenação no menu
  order           Int       @default(0)
  
  // Configuração de exibição
  displayType     DisplayType @default(TABLE)
  icon            String?   // Nome do ícone
  
  active          Boolean   @default(true)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([area, active, order])
}

enum DisplayType {
  TABLE           // Padrão 1: Listagem estruturada
  CARDS           // Padrão 2: Cards informativos
  PAGE_WITH_DOCS  // Padrão 3: Página + documentos
}
```

#### 3. Bidding (Licitação)
```prisma
model Bidding {
  id              String    @id @default(cuid())
  
  // Identificação
  number          String    @unique // "001/2024"
  title           String
  description     String    @db.Text
  
  // Classificação
  modality        BiddingModality // Pregão, Concorrência...
  type            BiddingType     // Menor preço, Melhor técnica...
  
  // Status do processo
  status          BiddingStatus
  
  // Datas importantes
  publicationDate DateTime
  openingDate     DateTime?
  closingDate     DateTime?
  
  // Valores
  estimatedValue  Decimal?  @db.Decimal(15, 2)
  finalValue      Decimal?  @db.Decimal(15, 2)
  
  // Documentos relacionados
  documents       Document[]
  
  // Resultado
  winner          String?
  winnerDocument  String?   // CNPJ/CPF
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([status, openingDate])
  @@index([number])
}

enum BiddingModality {
  PREGAO_ELETRONICO
  PREGAO_PRESENCIAL
  CONCORRENCIA
  TOMADA_PRECOS
  CONVITE
  DISPENSA
  INEXIGIBILIDADE
}

enum BiddingType {
  MENOR_PRECO
  MELHOR_TECNICA
  TECNICA_PRECO
}

enum BiddingStatus {
  PLANEJAMENTO    // Planejamento
  PUBLICADO       // Aviso publicado
  EM_ANDAMENTO    // Em andamento
  HOMOLOGADO      // Homologado
  ADJUDICADO      // Adjudicado
  REVOGADO        // Revogado
  ANULADO         // Anulado
  DESERTO         // Deserto
  FRACASSADO      // Fracassado
}
```

#### 4. DocumentVersion (Versionamento)
```prisma
model DocumentVersion {
  id              String    @id @default(cuid())
  
  document        Document  @relation(fields: [documentId], references: [id], onDelete: Cascade)
  documentId      String
  
  version         Int
  filePath        String    // Caminho do arquivo desta versão
  fileSize        Int
  
  changes         String?   @db.Text // Descrição das mudanças
  
  createdBy       User      @relation(fields: [createdById], references: [id])
  createdById     String
  createdAt       DateTime  @default(now())
  
  @@unique([documentId, version])
  @@index([documentId])
}
```

#### 5. DocumentHistory (Auditoria)
```prisma
model DocumentHistory {
  id              String    @id @default(cuid())
  
  document        Document  @relation(fields: [documentId], references: [id], onDelete: Cascade)
  documentId      String
  
  action          HistoryAction
  changes         Json?     // Snapshot das mudanças
  notes           String?   @db.Text
  
  user            User      @relation(fields: [userId], references: [id])
  userId          String
  
  createdAt       DateTime  @default(now())
  
  @@index([documentId, createdAt])
}

enum HistoryAction {
  CREATED
  UPDATED
  PUBLISHED
  UNPUBLISHED
  APPROVED
  REJECTED
  ARCHIVED
  RESTORED
}
```

---

## 🗂️ Estrutura de Menu

### Transparência

```
Transparência/
├── Institucional
│   ├── Estatuto
│   ├── Regimento Interno
│   ├── Organograma
│   └── Atas de Reunião
│
├── Orçamento e Finanças
│   ├── Plano Orçamentário
│   ├── Execução Orçamentária
│   └── Balancetes
│
├── Despesas e Receitas
│   ├── Demonstrativos Mensais
│   ├── Planilhas de Despesas
│   └── Comprovantes
│
├── Contratos e Convênios
│   ├── Contratos Firmados
│   ├── Aditivos Contratuais
│   └── Convênios Ativos
│
├── Relatórios e Prestação de Contas
│   ├── Relatórios de Gestão
│   ├── Auditorias
│   └── Prestação de Contas Anual
│
└── Acesso à Informação
    ├── Lei de Acesso à Informação
    ├── Pedidos LAI
    └── Respostas Públicas
```

### Licitações

```
Licitações/
├── Avisos e Editais
│   ├── Editais Publicados
│   ├── Avisos de Licitação
│   └── Termos de Referência
│
├── Licitações em Andamento
│   ├── Pregões em Curso
│   ├── Impugnações e Recursos
│   └── Esclarecimentos
│
├── Licitações Encerradas
│   ├── Homologadas
│   ├── Adjudicadas
│   └── Desertas/Fracassadas
│
├── Resultados e Atas
│   ├── Atas de Sessão
│   ├── Mapas Comparativos
│   └── Pareceres Técnicos
│
├── Contratos Firmados
│   ├── Contratos Vigentes
│   ├── Aditivos
│   └── Rescisões
│
└── Planejamento de Compras
    ├── Plano Anual de Compras
    ├── Pesquisas de Preço
    └── Estudos Técnicos
```

---

## 🎨 Padrões de Exibição

### Padrão 1: Tabela (TABLE)

**Uso:** Relatórios, Despesas, Contratos, Licitações Encerradas

**Características:**
- Ordenável por coluna
- Busca e filtros
- Download direto
- Visualização compacta

**Exemplo:**
```
┌─────────────┬──────────┬────────┬──────────┬─────────┐
│ Documento   │ Tipo     │ Ano    │ Data     │ Ações   │
├─────────────┼──────────┼────────┼──────────┼─────────┤
│ Relatório...│ PDF      │ 2024   │ 15/12/24 │ 📥 Ver  │
│ Balanço...  │ XLSX     │ 2024   │ 10/12/24 │ 📥 Ver  │
└─────────────┴──────────┴────────┴──────────┴─────────┘
```

### Padrão 2: Cards (CARDS)

**Uso:** Avisos, Editais Recentes, Licitações em Andamento

**Características:**
- Visual destacado
- Informações-chave em destaque
- CTAs claros
- Ideal para items importantes/recentes

**Exemplo:**
```
┌──────────────────────────────┐
│  Pregão Eletrônico 005/2024  │
│  Aquisição de Equipamentos   │
│                              │
│  📅 Abertura: 20/12/2024     │
│  💰 Valor: R$ 150.000        │
│                              │
│  [Ver Edital] [Documentos]   │
└──────────────────────────────┘
```

### Padrão 3: Página + Docs (PAGE_WITH_DOCS)

**Uso:** Institucional, Acesso à Informação, Planejamento

**Características:**
- Conteúdo explicativo
- Documentos como anexos
- Contexto + arquivos

**Exemplo:**
```
Acesso à Informação
━━━━━━━━━━━━━━━━━━━

A Lei de Acesso à Informação...
[texto explicativo]

📎 Documentos Relacionados
├─ Lei 12.527/2011 [PDF]
├─ Cartilha LAI [PDF]
└─ Formulário de Pedido [DOCX]
```

---

## 🔄 Fluxo de Publicação

### Estados do Documento

```mermaid
DRAFT (Rascunho)
    ↓ (Solicita aprovação)
PENDING (Pendente)
    ↓ (Aprova)
PUBLISHED (Publicado)
    ↓ (Arquiva)
ARCHIVED (Arquivado)
```

### Permissões

| Ação              | Editor | Aprovador | Admin |
|-------------------|--------|-----------|-------|
| Criar rascunho    | ✅     | ✅        | ✅    |
| Editar rascunho   | ✅     | ✅        | ✅    |
| Solicitar aprovação| ✅    | ✅        | ✅    |
| Aprovar documento | ❌     | ✅        | ✅    |
| Publicar direto   | ❌     | ❌        | ✅    |
| Arquivar          | ❌     | ✅        | ✅    |

---

## 📁 Estrutura de Arquivos

### Storage (Uploads)

```
public/uploads/documents/
├── 2024/
│   ├── transparencia/
│   │   ├── relatorios/
│   │   │   ├── abc123-relatorio-gestao-2024.pdf
│   │   │   └── def456-balanco-semestral.pdf
│   │   └── contratos/
│   │       └── ghi789-contrato-001-2024.pdf
│   │
│   └── licitacao/
│       ├── editais/
│       │   └── jkl012-edital-pregao-005.pdf
│       └── atas/
│           └── mno345-ata-sessao-005.pdf
│
└── versions/  (versões antigas)
    └── abc123-v1-relatorio-gestao-2024.pdf
```

### Nomenclatura de Arquivos

```
{id}-{slug}-{versao}.{ext}

Exemplo:
cm4abc123-relatorio-gestao-2024-v1.pdf
```

---

## 🚀 Implementação Incremental

### Fase 1: Fundação (Semana 1)
- [x] Schema Prisma completo
- [ ] Migration inicial
- [ ] Seed de categorias padrão
- [ ] Admin: CRUD básico de categorias
- [ ] Admin: Upload de documentos

### Fase 2: Gestão de Documentos (Semana 2)
- [ ] Admin: Listagem de documentos
- [ ] Admin: Filtros e busca
- [ ] Admin: Edição de documentos
- [ ] Admin: Controle de status
- [ ] Sistema de permissões básico

### Fase 3: Exibição Pública (Semana 3)
- [ ] Menu dinâmico Transparência
- [ ] Menu dinâmico Licitações
- [ ] Páginas públicas (3 padrões)
- [ ] Sistema de busca público
- [ ] SEO e meta tags

### Fase 4: Licitações (Semana 4)
- [ ] CRUD de licitações
- [ ] Vinculação documentos ↔ licitação
- [ ] Timeline de licitação
- [ ] Páginas públicas de licitação

### Fase 5: Workflow (Semana 5)
- [ ] Fluxo de aprovação
- [ ] Notificações
- [ ] Painel de aprovações
- [ ] Logs de ações

### Fase 6: Versionamento (Semana 6)
- [ ] Sistema de versões
- [ ] Histórico de alterações
- [ ] Comparação de versões
- [ ] Restauração

### Fase 7: Auditoria (Semana 7)
- [ ] Log completo de ações
- [ ] Relatórios de auditoria
- [ ] Exportação de logs
- [ ] Dashboard de estatísticas

---

## 🎯 APIs REST

### Endpoints Admin

```
GET    /api/admin/documents
POST   /api/admin/documents
GET    /api/admin/documents/:id
PUT    /api/admin/documents/:id
DELETE /api/admin/documents/:id

POST   /api/admin/documents/:id/approve
POST   /api/admin/documents/:id/publish
POST   /api/admin/documents/:id/archive

GET    /api/admin/categories
POST   /api/admin/categories
PUT    /api/admin/categories/:id

GET    /api/admin/biddings
POST   /api/admin/biddings
GET    /api/admin/biddings/:id
PUT    /api/admin/biddings/:id
```

### Endpoints Públicos

```
GET /api/public/documents?area=TRANSPARENCIA&category=relatorios
GET /api/public/documents/:id
GET /api/public/documents/:id/download

GET /api/public/biddings?status=EM_ANDAMENTO
GET /api/public/biddings/:id
```

---

## 📊 Exemplo de Dados

### Categoria

```json
{
  "id": "cat_123",
  "name": "Relatórios e Prestação de Contas",
  "slug": "relatorios-prestacao-contas",
  "area": "TRANSPARENCIA",
  "displayType": "TABLE",
  "order": 5,
  "active": true
}
```

### Documento

```json
{
  "id": "doc_456",
  "title": "Relatório de Gestão 2024",
  "description": "Relatório completo das atividades realizadas...",
  "fileName": "relatorio-gestao-2024.pdf",
  "filePath": "/uploads/documents/2024/transparencia/relatorios/doc_456.pdf",
  "fileSize": 2048576,
  "fileType": "PDF",
  "area": "TRANSPARENCIA",
  "category": "Relatórios e Prestação de Contas",
  "year": 2024,
  "publishedAt": "2024-12-15T10:00:00Z",
  "status": "PUBLISHED",
  "version": 1,
  "createdBy": {
    "name": "João Silva",
    "email": "joao@inpacta.org.br"
  }
}
```

---

## ✅ Checklist de Qualidade

### Antes de publicar um documento:
- [ ] Título claro e descritivo
- [ ] Área e categoria corretas
- [ ] Ano de referência preenchido
- [ ] Arquivo em formato adequado (PDF preferencial)
- [ ] Tamanho de arquivo otimizado (< 10MB)
- [ ] Aprovação quando necessária
- [ ] Metadados SEO preenchidos

### Manutenção periódica:
- [ ] Revisar documentos antigos (arquivar?)
- [ ] Verificar links quebrados
- [ ] Atualizar categorias se necessário
- [ ] Backup dos arquivos
- [ ] Análise de uso/downloads

---

**Próximo passo:** Implementar o schema Prisma e começar pela Fase 1! 🚀
