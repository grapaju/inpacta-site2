# Melhorias: Licitações e Transparência

## 📋 Análise da Estrutura Atual

### ✅ O que JÁ temos implementado:

1. **Banco de Dados (Prisma Schema)**
   - ✅ Tabela `Bidding` (Licitações) com campos essenciais
   - ✅ Tabela `Document` com relacionamento opcional para licitações
   - ✅ Tabela `DocumentArea` e `DocumentCategory` para taxonomia
   - ✅ Enums para `BiddingModality`, `BiddingType`, `BiddingStatus`
   - ✅ Sistema de versionamento (`DocumentVersion`)
   - ✅ Sistema de auditoria (`DocumentHistory`)

2. **Campos Importantes no Bidding:**
   - ✅ `number` (único) - Número/Ano da licitação
   - ✅ `modality` - Pregão, Concorrência, Dispensa, etc.
   - ✅ `status` - Diversos status (PLANEJAMENTO, PUBLICADO, HOMOLOGADO, etc.)
   - ✅ `publicationDate`, `openingDate`, `closingDate`
   - ✅ `estimatedValue`, `finalValue`
   - ✅ `winner`, `winnerDocument` (CNPJ/CPF)
   - ✅ Relacionamento `documents` (1:N)

### ⚠️ O que FALTA implementar:

1. **No Banco de Dados:**
   - ❌ Campo `tipo_modulo` no Document (LICITACAO vs TRANSPARENCIA)
   - ❌ Campo `objeto` detalhado no Bidding
   - ❌ Tabela `BiddingPhase` ou `BiddingMovement` para histórico de fases
   - ❌ Campo `fase_documento` para organizar documentos por etapa
   - ❌ Campo `ordenacao` nos documentos para ordenar por prioridade
   - ❌ Campo `empresa_vencedora` (apenas temos `winner` como string)
   - ❌ Publicação agendada (`scheduled_publish_at`)

2. **No Admin:**
   - ❌ Interface separada para gestão de Licitações
   - ❌ Filtro por tipo de módulo (Licitação/Transparência)
   - ❌ Gerenciamento de fases dentro da licitação
   - ❌ Upload múltiplo de arquivos por fase
   - ❌ Ordenação visual dos documentos (drag & drop)
   - ❌ Status timeline (visual de progresso)
   - ❌ Log de alterações visível
   - ❌ Publicação agendada

---

## 🎯 Proposta de Melhorias

### 1. Alterações no Schema do Prisma

```prisma
// Adicionar enum para tipo de módulo
enum DocumentModule {
  LICITACAO
  TRANSPARENCIA
}

// Adicionar enum para fases da licitação
enum BiddingPhase {
  ABERTURA          // Edital, anexos, termo de referência
  QUESTIONAMENTOS   // Esclarecimentos, impugnações, respostas
  JULGAMENTO        // Atas de sessão, propostas, habilitação
  RECURSO           // Recursos e contra-razões
  HOMOLOGACAO       // Termo de homologação, adjudicação
  CONTRATACAO       // Contrato final, ordem de serviço
  EXECUCAO          // Aditivos, medições, fiscalização
  ENCERRAMENTO      // Termo de recebimento, avaliação
}

// Atualizar model Document
model Document {
  // ... campos existentes ...
  
  // NOVO: Tipo de módulo
  module          DocumentModule  @default(TRANSPARENCIA)
  
  // NOVO: Fase do documento (se for de licitação)
  phase           BiddingPhase?
  
  // NOVO: Ordenação dentro da fase
  order           Int             @default(0)
  
  // NOVO: Publicação agendada
  scheduledPublishAt DateTime?
  
  // ... resto dos campos ...
}

// Atualizar model Bidding
model Bidding {
  // ... campos existentes ...
  
  // MELHORAR: Objeto mais detalhado
  object          String          @db.Text  // NOVO: campo separado do description
  
  // NOVO: Campos adicionais para transparência
  legalBasis      String?         @db.Text  // Base legal
  srp             Boolean         @default(false) // Sistema de Registro de Preços
  
  // ... resto dos campos ...
  
  // NOVO: Histórico de movimentações
  movements       BiddingMovement[]
}

// NOVA TABELA: Histórico de movimentações da licitação
model BiddingMovement {
  id          String    @id @default(cuid())
  
  bidding     Bidding   @relation(fields: [biddingId], references: [id], onDelete: Cascade)
  biddingId   String
  
  phase       BiddingPhase
  description String    @db.Text
  date        DateTime  @default(now())
  
  // Auditoria
  createdBy   User      @relation(fields: [createdById], references: [id])
  createdById String
  createdAt   DateTime  @default(now())
  
  @@index([biddingId, date])
  @@map("bidding_movements")
}

// Atualizar HistoryAction
enum HistoryAction {
  CREATED
  UPDATED
  PUBLISHED
  UNPUBLISHED
  APPROVED
  REJECTED
  ARCHIVED
  RESTORED
  DELETED      // NOVO
  SCHEDULED    // NOVO
}

// Atualizar BiddingStatus (adicionar mais status)
enum BiddingStatus {
  PLANEJAMENTO
  PUBLICADO
  EM_ANDAMENTO
  SUSPENSA         // NOVO
  HOMOLOGADO
  ADJUDICADO
  REVOGADO
  ANULADO
  DESERTO
  FRACASSADO
  CONCLUIDA        // NOVO
}
```

### 2. Estrutura de Gestão no Admin

#### 2.1 Menu Principal
```
📋 Documentos
├── 📄 Transparência (filtro: module = TRANSPARENCIA)
└── 📋 Licitações (link para /admin/biddings)

⚖️ Licitações
├── 📋 Todas as Licitações
├── ➕ Nova Licitação
└── 📊 Relatórios
```

#### 2.2 Tela: Lista de Licitações (`/admin/biddings`)

**Filtros:**
- Status (Aberta, Em Andamento, Suspensa, Homologada, etc.)
- Modalidade (Pregão, Concorrência, etc.)
- Ano
- Busca por número ou objeto

**Colunas:**
- Número/Ano
- Objeto (resumido)
- Modalidade
- Status (badge colorido)
- Data de Abertura
- Valor Estimado
- Ações (Editar, Visualizar, Excluir)

**Badge de Status:**
```javascript
const statusColors = {
  PUBLICADO: 'green',
  EM_ANDAMENTO: 'blue',
  SUSPENSA: 'orange',
  HOMOLOGADO: 'gray',
  DESERTO: 'red',
  FRACASSADO: 'red',
  CONCLUIDA: 'gray'
};
```

#### 2.3 Tela: Editar Licitação (`/admin/biddings/[id]`)

**Estrutura em Abas:**

##### Aba 1: Dados Gerais
- Número/Ano
- Modalidade (select)
- Tipo (select)
- Objeto (textarea grande)
- Descrição adicional
- Base legal
- Status atual (select com cores)
- Datas (publicação, abertura, encerramento)
- Valores (estimado, final)
- Sistema de Registro de Preços (checkbox)

##### Aba 2: Documentação por Fase

**Acordeão com seções:**

```jsx
<Accordion>
  <AccordionItem title="📝 Fase de Abertura" phase="ABERTURA">
    <FileUploadZone 
      phase="ABERTURA"
      files={documents.filter(d => d.phase === 'ABERTURA')}
      onUpload={handleUpload}
      onReorder={handleReorder}
    />
  </AccordionItem>
  
  <AccordionItem title="❓ Questionamentos" phase="QUESTIONAMENTOS">
    <FileUploadZone phase="QUESTIONAMENTOS" ... />
  </AccordionItem>
  
  <AccordionItem title="⚖️ Julgamento" phase="JULGAMENTO">
    <FileUploadZone phase="JULGAMENTO" ... />
  </AccordionItem>
  
  <AccordionItem title="🏆 Homologação" phase="HOMOLOGACAO">
    <FileUploadZone phase="HOMOLOGACAO" ... />
  </AccordionItem>
  
  <AccordionItem title="📄 Contratação" phase="CONTRATACAO">
    <FileUploadZone phase="CONTRATACAO" ... />
  </AccordionItem>
  
  <AccordionItem title="⚙️ Execução" phase="EXECUCAO">
    <FileUploadZone phase="EXECUCAO" ... />
  </AccordionItem>
  
  <AccordionItem title="✅ Encerramento" phase="ENCERRAMENTO">
    <FileUploadZone phase="ENCERRAMENTO" ... />
  </AccordionItem>
</Accordion>
```

**Componente FileUploadZone:**
- Drag & drop (react-dropzone)
- Upload múltiplo
- Progresso de upload
- Lista de arquivos com:
  - Título editável inline
  - Botão de download
  - Botão de excluir
  - Handle para reordenar (drag & drop)
- Validação: apenas PDF, DOCX, XLSX
- Renomeação automática (remove espaços e acentos)

##### Aba 3: Resultado

- Status final (select)
- Empresa vencedora (input)
- CNPJ (input com máscara)
- Valor final (input currency)
- Data de homologação
- Observações

##### Aba 4: Histórico de Movimentações

Timeline vertical com:
- Data e hora
- Fase/Etapa
- Descrição da movimentação
- Usuário responsável
- Botão "Adicionar Movimentação"

**Modal para adicionar movimentação:**
- Fase (select)
- Descrição (textarea)
- Data (datepicker)

##### Aba 5: Log de Alterações

Lista de todas as alterações feitas:
- Data e hora
- Usuário
- Ação (UPDATED, PUBLISHED, etc.)
- Detalhes das mudanças (diff JSON)

#### 2.4 Tela: Nova Licitação (`/admin/biddings/new`)

Formulário com os campos essenciais:
1. Número/Ano (validação de duplicata)
2. Modalidade
3. Tipo
4. Objeto (textarea)
5. Data de publicação (agendamento opcional)
6. Valor estimado

Após criar, redirecionar para a tela de edição completa.

#### 2.5 Melhorias na Listagem de Documentos

**Adicionar filtro "Tipo de Módulo":**
```jsx
<select name="module">
  <option value="">Todos os módulos</option>
  <option value="TRANSPARENCIA">Transparência</option>
  <option value="LICITACAO">Licitação</option>
</select>
```

**Se filtrar por LICITACAO:**
- Adicionar coluna "Licitação" (número/ano)
- Adicionar coluna "Fase"
- Permitir filtrar por licitação específica

---

## 🛠️ Implementação Técnica

### 3.1 Migration do Prisma

```bash
# Criar migration para adicionar os novos campos e tabelas
npx prisma migrate dev --name add_bidding_improvements
```

### 3.2 APIs Necessárias

#### Licitações:
- `GET /api/admin/biddings` - Listar licitações
- `POST /api/admin/biddings` - Criar licitação
- `GET /api/admin/biddings/[id]` - Obter licitação com documentos
- `PATCH /api/admin/biddings/[id]` - Atualizar licitação
- `DELETE /api/admin/biddings/[id]` - Deletar licitação (apenas se não tiver documentos)
- `POST /api/admin/biddings/[id]/movements` - Adicionar movimentação
- `GET /api/admin/biddings/[id]/history` - Histórico de alterações

#### Documentos (ajustes):
- Adicionar campo `module` no POST/PATCH
- Adicionar campo `phase` no POST/PATCH
- Adicionar campo `order` no POST/PATCH
- Adicionar campo `scheduledPublishAt` no POST
- Implementar ordenação (PATCH com array de IDs)

#### Upload (ajustes):
- Aceitar `module` e `phase` nos parâmetros
- Criar subpastas por fase: `/uploads/licitacoes/{number}/{phase}/`

### 3.3 Componentes React

**Novos componentes:**
1. `BiddingList.jsx` - Lista de licitações
2. `BiddingForm.jsx` - Formulário de licitação
3. `BiddingPhases.jsx` - Acordeão de fases
4. `FileUploadZone.jsx` - Zona de upload com drag & drop
5. `BiddingTimeline.jsx` - Timeline de movimentações
6. `StatusBadgeBidding.jsx` - Badge de status de licitação
7. `BiddingFilters.jsx` - Filtros da lista

**Melhorias em componentes existentes:**
1. `DocumentUpload.jsx` - Adicionar suporte a múltiplos arquivos
2. `Pagination.jsx` - (já existe)
3. `StatusBadge.jsx` - Adicionar mais cores para novos status

### 3.4 Stack Sugerido

```json
{
  "dependencies": {
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "react-dropzone": "^14.2.0",
    "@tanstack/react-table": "^8.10.0",
    "react-toastify": "^9.1.0",
    "date-fns": "^2.30.0",
    "react-dnd": "^16.0.0",
    "react-dnd-html5-backend": "^16.0.0"
  }
}
```

---

## 📊 Validações e Regras de Negócio

### 4.1 Validações no Cadastro de Licitação

```javascript
const biddingSchema = z.object({
  number: z.string().min(1, "Número é obrigatório").regex(/^\d{3}\/\d{4}$/, "Formato: 001/2024"),
  modality: z.enum(['PREGAO_ELETRONICO', 'PREGAO_PRESENCIAL', ...]),
  type: z.enum(['MENOR_PRECO', 'MELHOR_TECNICA', 'TECNICA_PRECO']),
  object: z.string().min(20, "Objeto deve ter pelo menos 20 caracteres"),
  publicationDate: z.date(),
  estimatedValue: z.number().positive().optional(),
  status: z.enum(['PLANEJAMENTO', 'PUBLICADO', ...])
});
```

### 4.2 Regras de Status

**Transições permitidas:**
```
PLANEJAMENTO → PUBLICADO
PUBLICADO → EM_ANDAMENTO
EM_ANDAMENTO → SUSPENSA (reversível)
EM_ANDAMENTO → HOMOLOGADO
HOMOLOGADO → ADJUDICADO
ADJUDICADO → CONCLUIDA
QUALQUER → REVOGADO
QUALQUER → ANULADO
```

**Campos obrigatórios por status:**
- `HOMOLOGADO`: winner, finalValue
- `ADJUDICADO`: winner, winnerDocument, finalValue
- `DESERTO`/`FRACASSADO`: reason (adicionar campo)

### 4.3 Exclusão de Licitações

**Regra:** Não pode excluir licitação que:
- Tenha status diferente de PLANEJAMENTO
- Tenha documentos vinculados
- Tenha movimentações registradas

```javascript
// API: DELETE /api/admin/biddings/[id]
if (bidding.status !== 'PLANEJAMENTO') {
  return res.status(403).json({
    error: 'Não é possível excluir licitações publicadas. Revogue ou anule ao invés de excluir.'
  });
}

if (bidding.documents.length > 0) {
  return res.status(403).json({
    error: 'Não é possível excluir licitações com documentos vinculados.'
  });
}
```

---

## 🎨 UX/UI Sugerida

### 5.1 Dashboard de Licitações

Cards com métricas:
- 📊 Total de Licitações
- 🟢 Ativas (PUBLICADO + EM_ANDAMENTO)
- 🟡 Aguardando Homologação
- 🔵 Homologadas no Ano
- 🔴 Desertas/Fracassadas

### 5.2 Cores por Status

```css
.status-planejamento { background: #6b7280; }
.status-publicado { background: #10b981; }
.status-em-andamento { background: #3b82f6; }
.status-suspensa { background: #f59e0b; }
.status-homologado { background: #6b7280; }
.status-adjudicado { background: #8b5cf6; }
.status-revogado { background: #ef4444; }
.status-anulado { background: #ef4444; }
.status-deserto { background: #ef4444; }
.status-fracassado { background: #ef4444; }
.status-concluida { background: #6b7280; }
```

### 5.3 Feedback Visual

- Toast de sucesso ao publicar documento
- Confirmação antes de deletar documento de licitação
- Loading state durante upload
- Progresso de upload (barra)
- Badge de "novo" em movimentações recentes (últimas 24h)

---

## 🚀 Plano de Implementação (Fases)

### Fase 1: Banco de Dados (1-2 dias)
1. ✅ Atualizar schema.prisma com novos campos e tabelas
2. ✅ Criar migration
3. ✅ Testar migration em dev
4. ✅ Seed de dados de teste

### Fase 2: APIs Backend (2-3 dias)
1. Criar APIs de licitações (CRUD)
2. Criar API de movimentações
3. Atualizar APIs de documentos (adicionar module, phase, order)
4. Atualizar API de upload
5. Implementar ordenação de documentos

### Fase 3: Componentes Base (2-3 dias)
1. BiddingList component
2. BiddingForm component
3. FileUploadZone component (com drag & drop)
4. StatusBadgeBidding component
5. BiddingFilters component

### Fase 4: Páginas Admin (3-4 dias)
1. Página de lista de licitações
2. Página de nova licitação
3. Página de edição com abas
4. Integração com upload de documentos por fase
5. Timeline de movimentações

### Fase 5: Melhorias Finais (2-3 dias)
1. Ordenação visual de documentos (drag & drop)
2. Publicação agendada
3. Dashboard com métricas
4. Relatórios
5. Testes e ajustes

**TOTAL ESTIMADO: 10-15 dias de desenvolvimento**

---

## ✅ Checklist de Implementação

### Banco de Dados
- [ ] Adicionar enum `DocumentModule`
- [ ] Adicionar enum `BiddingPhase`
- [ ] Adicionar campos `module`, `phase`, `order`, `scheduledPublishAt` no Document
- [ ] Adicionar campo `object` detalhado no Bidding
- [ ] Adicionar campos `legalBasis`, `srp` no Bidding
- [ ] Criar model `BiddingMovement`
- [ ] Atualizar enum `BiddingStatus` (adicionar SUSPENSA, CONCLUIDA)
- [ ] Atualizar enum `HistoryAction` (adicionar DELETED, SCHEDULED)
- [ ] Criar migration
- [ ] Aplicar migration em dev
- [ ] Seed de dados de teste

### APIs
- [ ] GET /api/admin/biddings
- [ ] POST /api/admin/biddings
- [ ] GET /api/admin/biddings/[id]
- [ ] PATCH /api/admin/biddings/[id]
- [ ] DELETE /api/admin/biddings/[id]
- [ ] POST /api/admin/biddings/[id]/movements
- [ ] GET /api/admin/biddings/[id]/history
- [ ] Atualizar POST /api/admin/documents (adicionar module, phase, order)
- [ ] Atualizar PATCH /api/admin/documents/[id] (adicionar module, phase, order)
- [ ] PATCH /api/admin/documents/reorder (ordenação)
- [ ] Atualizar /api/admin/upload-document (adicionar phase, ajustar path)

### Componentes
- [ ] BiddingList.jsx
- [ ] BiddingForm.jsx
- [ ] BiddingPhases.jsx (acordeão)
- [ ] FileUploadZone.jsx (drag & drop)
- [ ] BiddingTimeline.jsx
- [ ] StatusBadgeBidding.jsx
- [ ] BiddingFilters.jsx
- [ ] Melhorar DocumentUpload.jsx (múltiplos arquivos)

### Páginas Admin
- [ ] /admin/biddings (lista)
- [ ] /admin/biddings/new (criar)
- [ ] /admin/biddings/[id] (editar com abas)
- [ ] Atualizar /admin/documents (adicionar filtro de módulo)
- [ ] Atualizar menu do AdminLayout

### CSS
- [ ] Estilos para lista de licitações
- [ ] Estilos para badges de status
- [ ] Estilos para acordeão de fases
- [ ] Estilos para zona de upload
- [ ] Estilos para timeline
- [ ] Cores por status
- [ ] Responsivo mobile

### Testes
- [ ] Criar licitação
- [ ] Editar licitação
- [ ] Upload de documentos por fase
- [ ] Reordenar documentos
- [ ] Adicionar movimentação
- [ ] Mudar status
- [ ] Excluir licitação (validações)
- [ ] Filtros e busca
- [ ] Publicação agendada

---

## 📚 Referências

- Lei de Acesso à Informação (LAI) - Lei 12.527/2011
- Portal da Transparência - Padrões de dados abertos
- Nova Lei de Licitações - Lei 14.133/2021
- Prisma ORM - https://www.prisma.io/docs
- React Hook Form - https://react-hook-form.com
- React Dropzone - https://react-dropzone.js.org
