# Sistema de Documentos - Status de Implementação

## ✅ Concluído

### 1. Arquitetura e Planejamento
- [x] `DOCUMENTS-ARCHITECTURE.md` - Especificação completa do sistema
- [x] `CONCEPTUAL-MODEL-ANALYSIS.md` - Validação do modelo conceitual
- [x] `ADMIN-ISOLATION-GUIDE.md` - Guia de isolamento CSS/componentes
- [x] `DEPLOY-DOCUMENT-SYSTEM.md` - Guia de deploy com comandos

### 2. Schema Prisma (`prisma/schema.prisma`)
- [x] **DocumentArea** - Áreas (Transparência, Licitações)
- [x] **DocumentCategory** - Categorias hierárquicas
- [x] **Document** - Documento universal com taxonomia
- [x] **Bidding** - Processos de licitação
- [x] **DocumentVersion** - Versionamento de arquivos
- [x] **DocumentHistory** - Auditoria de ações
- [x] **6 Enums** - DocumentStatus, DisplayType, BiddingModality, BiddingType, BiddingStatus, HistoryAction
- [x] **User relations** - documentsCreated, documentsUpdated, documentsApproved, documentVersions, documentHistory
- [x] **Role enum** - Adicionado APPROVER

### 3. Seeds (`prisma/seeds/`)
- [x] `documentStructure.js` - 48 categorias (2 áreas, 12 categorias, 36 subcategorias)
- [x] `seed.js` - Orquestrador principal
- [x] `package.json` - Script `db:seed:documents` adicionado

### 4. APIs Públicas
- [x] `GET /api/public/document-areas` - Listar áreas com categorias hierárquicas
  - Retorna estrutura completa para menus dinâmicos
  - Categorias ordenadas com subcategorias aninhadas

- [x] `GET /api/public/documents` - Listar documentos públicos
  - Filtros semânticos: areaSlug, categorySlug, subcategorySlug
  - Paginação: page, limit
  - Ordenação: sortBy (publishDate|title), sortOrder (asc|desc)
  - Retorna apenas status=PUBLISHED
  - Inclui dados completos: area, category, createdBy, bidding

### 5. APIs Admin
- [x] `GET /api/admin/documents` - Listar todos os documentos
  - Filtros: areaId, categoryId, status, search
  - Paginação completa
  - ADMIN vê todos, outros usuários veem apenas os próprios
  - Inclui contadores: _count.versions, _count.history

- [x] `POST /api/admin/documents` - Criar documento
  - Validação de campos obrigatórios
  - Status inicial baseado em role:
    - ADMIN → PUBLISHED (publica direto)
    - EDITOR → PENDING (precisa aprovação)
    - AUTHOR → DRAFT (apenas rascunho)
  - Registro automático no DocumentHistory (action=CREATED)

- [x] `GET /api/admin/documents/[id]` - Buscar documento específico
  - Retorna dados completos + versões + histórico
  - Permissão: ADMIN/APPROVER veem todos, outros veem apenas os próprios

- [x] `PATCH /api/admin/documents/[id]` - Atualizar documento
  - Validação de permissão (apenas criador ou ADMIN)
  - Versionamento automático ao trocar arquivo
  - Registro de mudanças no DocumentHistory
  - Apenas ADMIN pode mudar status para PUBLISHED

- [x] `DELETE /api/admin/documents/[id]` - Deletar documento
  - Apenas ADMIN pode deletar
  - Registra deleção no histórico antes de excluir

- [x] `POST /api/admin/documents/[id]/approve` - Aprovar documento
  - Apenas ADMIN e APPROVER podem aprovar
  - Muda status: PENDING → PUBLISHED
  - Registra ação no DocumentHistory

- [x] `GET /api/admin/biddings` - Listar licitações
  - Filtros: status, modality, year
  - Inclui contagem de documentos vinculados

- [x] `POST /api/admin/biddings` - Criar licitação
  - Validação de campos obrigatórios
  - Tratamento de erro de número duplicado

---

## 🔄 Em Progresso

### Executar no Servidor aaPanel

**Você precisa executar estes comandos no terminal SSH:**

```bash
cd /www/wwwroot/inpacta.org.br
npx prisma migrate dev --name add_document_system
npm run db:seed:documents
npm run build
```

Depois, reiniciar a aplicação no Node Manager do aaPanel.

---

## 📋 Próximos Passos

### Fase 1: Admin - CRUD de Documentos

#### 1.1 Página de Listagem
**Arquivo:** `/src/app/admin/documents/page.js`

**Funcionalidades:**
- Tabela com todos os documentos
- Filtros: área, categoria, status
- Busca por título/descrição
- Paginação
- Ações: Editar, Deletar, Visualizar, Aprovar (se PENDING)
- Indicadores visuais:
  - Badge de status (DRAFT=cinza, PENDING=amarelo, PUBLISHED=verde, ARCHIVED=vermelho)
  - Ícone de licitação vinculada
  - Contador de versões

**API usada:** `GET /api/admin/documents`

**Design (usar .admin-* classes):**
```jsx
// Estrutura sugerida
<div className="admin-documents-page">
  <header className="admin-page-header">
    <h1>Documentos</h1>
    <button className="admin-btn-primary">+ Novo Documento</button>
  </header>
  
  <div className="admin-filters">
    <select name="area">...</select>
    <select name="category">...</select>
    <select name="status">...</select>
    <input type="search" placeholder="Buscar..." />
  </div>
  
  <table className="admin-table">
    <thead>
      <tr>
        <th>Título</th>
        <th>Área</th>
        <th>Categoria</th>
        <th>Status</th>
        <th>Criado em</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      {documents.map(doc => (
        <tr key={doc.id}>
          <td>{doc.title}</td>
          <td>{doc.area.name}</td>
          <td>{doc.category.name}</td>
          <td><StatusBadge status={doc.status} /></td>
          <td>{formatDate(doc.createdAt)}</td>
          <td>
            <button>Editar</button>
            <button>Deletar</button>
            {doc.status === 'PENDING' && <button>Aprovar</button>}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  
  <Pagination />
</div>
```

#### 1.2 Página de Criação/Edição
**Arquivo:** `/src/app/admin/documents/new/page.js` e `/src/app/admin/documents/[id]/page.js`

**Funcionalidades:**
- Formulário com campos:
  - Título (obrigatório)
  - Descrição (textarea com rich text editor)
  - Área (select)
  - Categoria (select cascata baseado na área)
  - Upload de arquivo
  - Vincular a licitação (opcional, select com busca)
  - Data de publicação
  - Status (apenas ADMIN vê essa opção)
- Botões:
  - Salvar como Rascunho
  - Enviar para Aprovação (EDITOR)
  - Publicar (ADMIN)
  - Cancelar

**APIs usadas:**
- `POST /api/admin/documents` (criar)
- `PATCH /api/admin/documents/[id]` (editar)
- `GET /api/admin/documents/[id]` (carregar dados para edição)
- `GET /api/public/document-areas` (popular selects)
- `GET /api/admin/biddings` (select de licitações)

**Componente de Upload:**
- Drag & drop
- Preview do arquivo atual
- Indicador de tamanho/tipo
- Validação de extensões permitidas (PDF, DOC, XLS, JPG, PNG, ZIP)

#### 1.3 Modal de Aprovação
**Componente:** `/src/components/admin/ApproveDocumentModal.jsx`

**Funcionalidades:**
- Exibir detalhes do documento
- Campo para comentário (opcional)
- Botões: Aprovar, Rejeitar, Cancelar

**API usada:** `POST /api/admin/documents/[id]/approve`

#### 1.4 Componente de Upload
**Arquivo:** `/src/components/admin/DocumentUpload.jsx`

**Funcionalidades:**
- Área de drag & drop
- Seleção manual de arquivo
- Preview do arquivo selecionado
- Progress bar durante upload
- Validação de tamanho (max 50MB) e tipo
- Remoção de arquivo selecionado

**Endpoint de Upload (criar):**
```javascript
// /src/app/api/admin/upload/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const formData = await request.formData();
  const file = formData.get('file');
  const area = formData.get('area'); // 'transparencia' | 'licitacoes'
  const category = formData.get('category'); // 'orcamento-financas'
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  
  const year = new Date().getFullYear();
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents', String(year), area, category);
  
  await mkdir(uploadDir, { recursive: true });
  
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);
  
  const publicPath = `/uploads/documents/${year}/${area}/${category}/${filename}`;
  
  return NextResponse.json({
    success: true,
    filePath: publicPath,
    fileSize: file.size,
    fileType: file.type,
  });
}
```

---

### Fase 2: Admin - CRUD de Licitações

#### 2.1 Página de Listagem de Licitações
**Arquivo:** `/src/app/admin/biddings/page.js`

**Funcionalidades:**
- Tabela com todas as licitações
- Filtros: status, modalidade, ano
- Busca por número ou objeto
- Indicadores: status, documentos vinculados
- Ações: Editar, Ver Documentos

**API usada:** `GET /api/admin/biddings`

#### 2.2 Formulário de Licitação
**Arquivo:** `/src/app/admin/biddings/new/page.js` e `/src/app/admin/biddings/[id]/page.js`

**Campos:**
- Número da Licitação (obrigatório)
- Ano (obrigatório, default ano atual)
- Modalidade (select com enums)
- Tipo (select com enums)
- Objeto (textarea, obrigatório)
- Status (select com enums)
- Data de Publicação
- Data de Abertura
- Data de Encerramento
- Valor Estimado (R$)
- Valor Final (R$)

**APIs usadas:**
- `POST /api/admin/biddings` (criar)
- `PATCH /api/admin/biddings/[id]` (editar - CRIAR)

---

### Fase 3: Páginas Públicas

#### 3.1 Menu Dinâmico de Transparência
**Modificar:** `/src/app/layout.js` ou componente de menu

**Funcionalidade:**
- Buscar estrutura com `GET /api/public/document-areas`
- Renderizar menu dropdown hierárquico:
  - Transparência
    - Institucional
      - Estatuto Social
      - Regimento Interno
      - Atas de Reunião
    - Orçamento e Finanças
      - ...

**Links:**
- Categoria principal: `/transparencia/institucional`
- Subcategoria: `/transparencia/institucional/estatuto-social`

#### 3.2 Página de Transparência com Filtros
**Arquivo:** `/src/app/transparencia/[...slugs]/page.js`

**Funcionalidades:**
- Capturar slugs da URL: `[categorySlug]` ou `[categorySlug]/[subcategorySlug]`
- Buscar documentos com `GET /api/public/documents?areaSlug=transparencia&categorySlug=...`
- Renderizar conforme `displayType` da categoria:
  - **TABLE:** Tabela ordenável com título, data, tamanho, download
  - **CARDS:** Grid de cards visuais
  - **PAGE_WITH_DOCS:** Conteúdo estático + lista de documentos anexos

**Breadcrumb:**
```
Home > Transparência > Orçamento e Finanças > Balancetes
```

#### 3.3 Página de Licitações
**Arquivo:** `/src/app/licitacoes/[...slugs]/page.js`

**Similar a Transparência, mas com funcionalidades extras:**
- Exibir dados da licitação (se documento estiver vinculado)
- Agrupar documentos por licitação
- Mostrar timeline do processo licitatório

---

### Fase 4: Melhorias

#### 4.1 Dashboard de Estatísticas
**Arquivo:** `/src/app/admin/dashboard/page.js`

**Widgets:**
- Total de documentos por status
- Documentos pendentes de aprovação
- Documentos publicados este mês
- Licitações ativas
- Atividade recente (últimas 10 ações do DocumentHistory)

#### 4.2 Visualizador de Histórico
**Componente:** `/src/components/admin/DocumentHistoryViewer.jsx`

**Funcionalidades:**
- Timeline de ações
- Diff de mudanças (antes/depois)
- Filtros por tipo de ação
- Exportar log em PDF

#### 4.3 Gerenciador de Versões
**Componente:** `/src/components/admin/DocumentVersions.jsx`

**Funcionalidades:**
- Listar todas as versões do documento
- Download de versão específica
- Comparar versões (diff visual)
- Restaurar versão anterior

#### 4.4 Notificações
**Sistema de notificações para:**
- EDITOR: Documento criado aguardando aprovação
- APPROVER: Novo documento para aprovar
- AUTHOR: Documento aprovado/rejeitado

---

## 🎨 Guia de Estilo (Admin)

### Estrutura de Classes CSS

**Arquivo:** `/src/styles/admin.css`

```css
/* Container principal */
.admin-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header da página */
.admin-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.admin-page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a1a;
}

/* Botões */
.admin-btn-primary {
  background: #0070f3;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.admin-btn-primary:hover {
  background: #0051cc;
}

.admin-btn-secondary {
  background: #f3f4f6;
  color: #374151;
  /* ... */
}

.admin-btn-danger {
  background: #ef4444;
  color: white;
  /* ... */
}

/* Filtros */
.admin-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.admin-filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
}

.admin-filter-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

/* Tabela */
.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.admin-table thead {
  background: #f9fafb;
}

.admin-table th {
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.admin-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.admin-table tbody tr:hover {
  background: #f9fafb;
}

/* Badges de Status */
.admin-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.admin-badge-draft {
  background: #f3f4f6;
  color: #6b7280;
}

.admin-badge-pending {
  background: #fef3c7;
  color: #92400e;
}

.admin-badge-published {
  background: #d1fae5;
  color: #065f46;
}

.admin-badge-archived {
  background: #fee2e2;
  color: #991b1b;
}

/* Formulário */
.admin-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.admin-form-group {
  margin-bottom: 1.5rem;
}

.admin-form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.admin-form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}

.admin-form-input:focus {
  outline: none;
  border-color: #0070f3;
  box-shadow: 0 0 0 3px rgba(0,112,243,0.1);
}

.admin-form-textarea {
  min-height: 120px;
  resize: vertical;
}

.admin-form-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Upload de Arquivo */
.admin-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-upload-area:hover {
  border-color: #0070f3;
  background: #f0f9ff;
}

.admin-upload-area.dragover {
  border-color: #0070f3;
  background: #dbeafe;
}

/* Paginação */
.admin-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.admin-pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.admin-pagination-btn.active {
  background: #0070f3;
  color: white;
  border-color: #0070f3;
}

.admin-pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## 📊 Estrutura de Arquivos Completa

```
src/
├── app/
│   ├── admin/
│   │   ├── documents/
│   │   │   ├── page.js              ← Listar documentos
│   │   │   ├── new/
│   │   │   │   └── page.js          ← Criar documento
│   │   │   └── [id]/
│   │   │       └── page.js          ← Editar documento
│   │   ├── biddings/
│   │   │   ├── page.js              ← Listar licitações
│   │   │   ├── new/
│   │   │   │   └── page.js          ← Criar licitação
│   │   │   └── [id]/
│   │   │       └── page.js          ← Editar licitação
│   │   └── dashboard/
│   │       └── page.js              ← Dashboard de estatísticas
│   ├── transparencia/
│   │   └── [...slugs]/
│   │       └── page.js              ← Páginas dinâmicas de transparência
│   ├── licitacoes/
│   │   └── [...slugs]/
│   │       └── page.js              ← Páginas dinâmicas de licitações
│   └── api/
│       ├── public/
│       │   ├── document-areas/
│       │   │   └── route.js         ✅ Listar áreas com categorias
│       │   └── documents/
│       │       └── route.js         ✅ Listar documentos públicos
│       └── admin/
│           ├── documents/
│           │   ├── route.js         ✅ GET/POST documentos
│           │   └── [id]/
│           │       ├── route.js     ✅ GET/PATCH/DELETE documento
│           │       └── approve/
│           │           └── route.js ✅ POST aprovar documento
│           ├── biddings/
│           │   ├── route.js         ✅ GET/POST licitações
│           │   └── [id]/
│           │       └── route.js     🔜 GET/PATCH/DELETE licitação
│           └── upload/
│               └── route.js         🔜 POST upload de arquivo
├── components/
│   └── admin/
│       ├── DocumentUpload.jsx       🔜 Componente de upload
│       ├── ApproveDocumentModal.jsx 🔜 Modal de aprovação
│       ├── DocumentHistoryViewer.jsx 🔜 Visualizador de histórico
│       ├── DocumentVersions.jsx     🔜 Gerenciador de versões
│       ├── StatusBadge.jsx          🔜 Badge de status
│       └── Pagination.jsx           🔜 Componente de paginação
└── styles/
    └── admin.css                    🔜 Estilos isolados do admin
```

---

## 🚀 Comando Rápido para Continuar

```bash
# No terminal SSH do aaPanel:
cd /www/wwwroot/inpacta.org.br
npx prisma migrate dev --name add_document_system
npm run db:seed:documents
npm run build

# Depois reiniciar no Node Manager
```

**Após executar, teste:**
```
https://inpacta.org.br/api/public/document-areas
```

**Retorno esperado:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "transparencia",
      "name": "Transparência",
      "categories": [ /* 6 categorias */ ]
    },
    {
      "id": 2,
      "slug": "licitacoes",
      "name": "Licitações",
      "categories": [ /* 6 categorias */ ]
    }
  ]
}
```

---

## 📞 Precisa de Ajuda?

Se algum erro ocorrer durante a migração ou seed, consulte:
- [DEPLOY-DOCUMENT-SYSTEM.md](./DEPLOY-DOCUMENT-SYSTEM.md) - Guia de troubleshooting
- [AAPANEL-DATABASE-SETUP.md](./AAPANEL-DATABASE-SETUP.md) - Configuração do PostgreSQL

**Comando útil para debug:**
```bash
# Ver tabelas criadas
psql -U inpacta_user -d inpacta_db -c "\dt"

# Contar categorias
psql -U inpacta_user -d inpacta_db -c "SELECT COUNT(*) FROM \"DocumentCategory\";"

# Ver áreas criadas
psql -U inpacta_user -d inpacta_db -c "SELECT * FROM \"DocumentArea\";"
```

---

**Status:** Aguardando execução dos comandos de migração e seed no servidor. Todos os arquivos de código estão prontos! 🎉
