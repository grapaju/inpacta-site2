# 📋 REFERÊNCIA RÁPIDA - APIs de Documentos

## 🌐 APIs Públicas

### 1. Listar Áreas e Categorias
```http
GET /api/public/document-areas
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "transparencia",
      "name": "Transparência",
      "categories": [
        {
          "id": 1,
          "slug": "institucional",
          "name": "Institucional",
          "displayType": "TABLE",
          "order": 1,
          "children": [
            {
              "id": 7,
              "slug": "estatuto-social",
              "name": "Estatuto Social",
              "order": 1
            }
          ]
        }
      ]
    }
  ]
}
```

### 2. Listar Documentos Públicos
```http
GET /api/public/documents?areaSlug=transparencia&categorySlug=institucional
```

**Query Params:**
- `areaSlug`: transparencia | licitacoes
- `categorySlug`: slug da categoria
- `subcategorySlug`: slug da subcategoria
- `status`: PUBLISHED (padrão)
- `page`: número da página (padrão 1)
- `limit`: itens por página (padrão 20)
- `sortBy`: publishDate | title
- `sortOrder`: asc | desc

**Resposta:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": 1,
        "title": "Estatuto Social 2024",
        "description": "Estatuto social atualizado",
        "filePath": "/uploads/documents/2024/transparencia/institucional/estatuto.pdf",
        "fileSize": 1024000,
        "fileType": "application/pdf",
        "publishDate": "2024-01-15T00:00:00.000Z",
        "status": "PUBLISHED",
        "area": {
          "id": 1,
          "slug": "transparencia",
          "name": "Transparência"
        },
        "category": {
          "id": 7,
          "slug": "estatuto-social",
          "name": "Estatuto Social",
          "displayType": "TABLE",
          "parent": {
            "id": 1,
            "slug": "institucional",
            "name": "Institucional"
          }
        },
        "createdBy": {
          "id": 1,
          "name": "Admin"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## 🔐 APIs Admin (Requer Autenticação)

### 3. Listar Documentos (Admin)
```http
GET /api/admin/documents
Authorization: Bearer {token}
```

**Query Params:**
- `areaId`: número
- `categoryId`: número
- `status`: DRAFT | PENDING | PUBLISHED | ARCHIVED
- `search`: busca textual em título/descrição
- `page`: número da página
- `limit`: itens por página

**Permissão:**
- ADMIN: vê todos os documentos
- EDITOR/AUTHOR: vê apenas os próprios

### 4. Criar Documento
```http
POST /api/admin/documents
Content-Type: application/json
Authorization: Bearer {token}
```

**Body:**
```json
{
  "title": "Documento Teste",
  "description": "Descrição do documento",
  "areaId": 1,
  "categoryId": 7,
  "filePath": "/uploads/documents/2024/transparencia/institucional/doc.pdf",
  "fileUrl": "https://inpacta.org.br/uploads/documents/2024/transparencia/institucional/doc.pdf",
  "fileSize": 1024000,
  "fileType": "application/pdf",
  "publishDate": "2024-01-15",
  "biddingId": null,
  "status": "DRAFT"
}
```

**Campos Obrigatórios:**
- `title`
- `areaId`
- `categoryId`

**Status Inicial (auto-definido):**
- ADMIN → PUBLISHED (se não especificar)
- EDITOR → PENDING
- AUTHOR → DRAFT

### 5. Buscar Documento Específico
```http
GET /api/admin/documents/1
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Documento Teste",
    "status": "PUBLISHED",
    "versions": [
      {
        "id": 1,
        "version": 1,
        "filePath": "/uploads/.../doc-v1.pdf",
        "changes": "Versão inicial",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "history": [
      {
        "id": 1,
        "action": "CREATED",
        "timestamp": "2024-01-15T10:00:00.000Z",
        "user": {
          "id": 1,
          "name": "Admin"
        },
        "changes": {
          "status": "PUBLISHED",
          "title": "Documento Teste"
        }
      }
    ]
  }
}
```

### 6. Atualizar Documento
```http
PATCH /api/admin/documents/1
Content-Type: application/json
Authorization: Bearer {token}
```

**Body (todos os campos opcionais):**
```json
{
  "title": "Novo título",
  "description": "Nova descrição",
  "areaId": 1,
  "categoryId": 7,
  "filePath": "/novo/caminho.pdf",
  "status": "PUBLISHED"
}
```

**Regras:**
- Apenas criador ou ADMIN pode editar
- Mudança de arquivo cria nova versão automaticamente
- Apenas ADMIN pode publicar diretamente (status=PUBLISHED)

### 7. Deletar Documento
```http
DELETE /api/admin/documents/1
Authorization: Bearer {token}
```

**Permissão:** Apenas ADMIN

### 8. Aprovar Documento
```http
POST /api/admin/documents/1/approve
Authorization: Bearer {token}
```

**Permissão:** ADMIN ou APPROVER

**Efeito:**
- Muda status: PENDING → PUBLISHED
- Define `approvedById`
- Atualiza `publishDate`
- Registra no histórico

### 9. Listar Licitações
```http
GET /api/admin/biddings
Authorization: Bearer {token}
```

**Query Params:**
- `status`: PLANNED | OPEN | IN_ANALYSIS | AWARDED | CONTRACTED | CANCELLED | DESERTED | FAILED
- `modality`: PREGAO_ELETRONICO | PREGAO_PRESENCIAL | CONCORRENCIA | ...
- `year`: número

### 10. Criar Licitação
```http
POST /api/admin/biddings
Content-Type: application/json
Authorization: Bearer {token}
```

**Body:**
```json
{
  "number": "001/2024",
  "year": 2024,
  "modality": "PREGAO_ELETRONICO",
  "type": "MENOR_PRECO",
  "object": "Aquisição de materiais de escritório",
  "status": "PLANNED",
  "publicationDate": "2024-02-01",
  "openingDate": "2024-02-15",
  "estimatedValue": 50000.00
}
```

**Campos Obrigatórios:**
- `number`
- `year`
- `modality`
- `type`
- `object`

---

## 🎨 Exemplos de Uso (Frontend)

### Renderizar Menu Dinâmico
```jsx
'use client';
import { useEffect, useState } from 'react';

export default function DynamicMenu() {
  const [areas, setAreas] = useState([]);
  
  useEffect(() => {
    fetch('/api/public/document-areas')
      .then(res => res.json())
      .then(data => setAreas(data.data));
  }, []);
  
  return (
    <nav>
      {areas.map(area => (
        <div key={area.id}>
          <h3>{area.name}</h3>
          <ul>
            {area.categories.map(category => (
              <li key={category.id}>
                <a href={`/${area.slug}/${category.slug}`}>
                  {category.name}
                </a>
                {category.children.length > 0 && (
                  <ul>
                    {category.children.map(sub => (
                      <li key={sub.id}>
                        <a href={`/${area.slug}/${sub.slug}`}>
                          {sub.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
```

### Listar Documentos com Filtros
```jsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const searchParams = useSearchParams();
  
  const categorySlug = searchParams.get('category');
  
  useEffect(() => {
    const url = `/api/public/documents?areaSlug=transparencia&categorySlug=${categorySlug}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => setDocuments(data.data.documents));
  }, [categorySlug]);
  
  return (
    <table className="documents-table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Data</th>
          <th>Tamanho</th>
          <th>Download</th>
        </tr>
      </thead>
      <tbody>
        {documents.map(doc => (
          <tr key={doc.id}>
            <td>{doc.title}</td>
            <td>{new Date(doc.publishDate).toLocaleDateString()}</td>
            <td>{(doc.fileSize / 1024).toFixed(2)} KB</td>
            <td>
              <a href={doc.filePath} download>
                📥 Baixar
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Criar Documento (Admin)
```jsx
'use client';
import { useState } from 'react';

export default function CreateDocumentForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    areaId: 1,
    categoryId: 1,
    filePath: '',
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const res = await fetch('/api/admin/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    const data = await res.json();
    
    if (data.success) {
      alert('Documento criado com sucesso!');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-form-group">
        <label className="admin-form-label">Título *</label>
        <input
          type="text"
          className="admin-form-input"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>
      
      <div className="admin-form-group">
        <label className="admin-form-label">Descrição</label>
        <textarea
          className="admin-form-input admin-form-textarea"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>
      
      {/* Outros campos... */}
      
      <button type="submit" className="admin-btn-primary">
        Criar Documento
      </button>
    </form>
  );
}
```

### Upload de Arquivo
```jsx
'use client';
import { useState } from 'react';

export default function DocumentUpload({ areaSlug, categorySlug, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('area', areaSlug);
    formData.append('category', categorySlug);
    
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.success) {
        onUploadComplete({
          filePath: data.filePath,
          fileSize: data.fileSize,
          fileType: data.fileType,
        });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="admin-upload-area">
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.zip"
      />
      {uploading && <p>Enviando arquivo...</p>}
    </div>
  );
}
```

---

## 🔑 Enums de Referência

### DocumentStatus
- `DRAFT` - Rascunho
- `PENDING` - Aguardando aprovação
- `PUBLISHED` - Publicado
- `ARCHIVED` - Arquivado

### DisplayType
- `TABLE` - Lista tabular ordenável
- `CARDS` - Cards visuais em grid
- `PAGE_WITH_DOCS` - Página estática + documentos anexos

### BiddingModality
- `PREGAO_ELETRONICO`
- `PREGAO_PRESENCIAL`
- `CONCORRENCIA`
- `TOMADA_PRECOS`
- `CONVITE`
- `DISPENSA`
- `INEXIGIBILIDADE`

### BiddingType
- `MENOR_PRECO`
- `MELHOR_TECNICA`
- `TECNICA_E_PRECO`
- `MAIOR_LANCE`

### BiddingStatus
- `PLANNED` - Planejada
- `OPEN` - Aberta
- `IN_ANALYSIS` - Em análise
- `AWARDED` - Homologada
- `CONTRACTED` - Contratada
- `CANCELLED` - Cancelada
- `DESERTED` - Deserta
- `FAILED` - Fracassada

### HistoryAction
- `CREATED`
- `UPDATED`
- `PUBLISHED`
- `ARCHIVED`
- `DELETED`
- `VERSION_CREATED`

---

## 🧪 Testes com cURL

```bash
# 1. Listar áreas
curl https://inpacta.org.br/api/public/document-areas | jq

# 2. Listar documentos de transparência
curl "https://inpacta.org.br/api/public/documents?areaSlug=transparencia&categorySlug=institucional" | jq

# 3. Criar documento (precisa de autenticação)
curl -X POST https://inpacta.org.br/api/admin/documents \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "title": "Teste API",
    "areaId": 1,
    "categoryId": 1
  }' | jq

# 4. Aprovar documento
curl -X POST https://inpacta.org.br/api/admin/documents/1/approve \
  -H "Cookie: next-auth.session-token=..." | jq
```

---

## 📞 Códigos de Erro

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 400 | Dados inválidos (campos obrigatórios faltando) |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

**Formato de erro:**
```json
{
  "success": false,
  "error": "Mensagem descritiva do erro"
}
```

---

**Última atualização:** $(date +%Y-%m-%d)
