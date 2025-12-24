# Arquitetura Centralizada de Documentos Públicos

**Frase-âncora (não negociável):**

> Documento é entidade única. Página é apenas contexto de exibição. Versão é histórico imutável.

---

## 1) Contexto editorial (obrigatório)

O site tem **duas páginas consumidoras** de documentos. Nenhuma delas faz upload direto.

### /transparencia

Exibe documentos em boxes temáticos (agrupamento por `categoria_macro`):

- **Relatórios Financeiros** (balanços, demonstrativos, execução orçamentária, auditorias)
- **Relatórios de Gestão** (relatórios de atividades, resultados, impacto)
- **Documentos Oficiais** (atos normativos, regimentos, estatutos, constituição)

### /licitacao/regulamento

Filtra documentos com `aparece_em = licitacoes` e organiza em blocos por `subcategoria` (string livre):

- **Regulamento**
- **Modelos de Edital**
- **Termos de Referência**

### Regra institucional

- Um mesmo documento pode aparecer em mais de uma página.
- **Nunca deve existir upload duplicado do mesmo PDF.**

---

## 2) Objetivo do sistema

Criar (ou refatorar) um **painel administrativo único** para gerenciar **todos os documentos públicos**, eliminando:

- Mistura de “documento” com “arquivo PDF”
- Duplicação de uploads
- Versionamento frágil (sobrescrita)
- Estruturas acopladas a páginas

Foco: **clareza, simplicidade, manutenção a longo prazo, conformidade institucional**.

---

## 3) Arquitetura geral (visão de alto nível)

### Componentes

1. **Admin (único)**
   - CRUD de metadados de `Documento`
   - Gestão de versões (`VersaoDocumento`) em aba separada
   - Upload de PDF (serviço/endpoint de upload já existente), retornando referência do arquivo

2. **API Admin**
   - Endpoints para listar/filtrar documentos
   - Endpoints para adicionar nova versão e tornar versão vigente
   - Regras de consistência em transação (uma vigente por documento)

3. **API Pública**
   - Retorna somente documentos `published` + **versão vigente**
   - Frontend apenas consome e agrupa

4. **Frontend (consumidor)**
   - Não cria/edita documentos
   - Agrupa para /transparencia e /licitacao/regulamento

---

## 4) Modelo de dados (não negociável)

### Entidade principal: Documento

Representa a entidade institucional. **Nunca armazena PDF.**

Campos (obrigatórios no nível de regra de negócio):

- `id` (UUID)
- `titulo`
- `slug` (único)
- `categoria_macro` (enum)
- `subcategoria` (string livre)
- `descricao_curta`
- `orgao_emissor`
- `aparece_em` (array): `transparencia`, `licitacoes`
- `status` (enum): `draft`, `published`, `archived`
- `ordem_exibicao`
- `versao_vigente_id` (FK)
- `created_at`, `updated_at`

### Entidade secundária: VersaoDocumento

Representa cada versão histórica (com PDF). **PDFs nunca são sobrescritos.**

- `id` (UUID)
- `documento_id` (FK)
- `numero_identificacao` (ex: "DIR_EXEC 001/2025")
- `versao` (1, 2, 3…)
- `data_aprovacao`
- `descricao_alteracao`
- `arquivo_pdf`
- `file_size`
- `is_vigente` (boolean)
- `created_at`
- `created_by`

### Regras obrigatórias (consistência)

1. PDFs nunca são sobrescritos: qualquer troca = nova `VersaoDocumento`.
2. Cada nova versão cria um registro novo.
3. Apenas **uma** versão pode ser `is_vigente = true` por `documento_id`.
4. Ao tornar uma versão vigente, a anterior é automaticamente desativada.
5. Histórico nunca é apagado.

---

## 5) Schema (Prisma) proposto

Observações:

- PostgreSQL suporta UUID nativamente: `@default(uuid()) @db.Uuid`.
- O requisito “aparece_em como array” é implementado como **array de enum** (mais seguro que string).
- A restrição “apenas uma vigente” é garantida por **transação na API** (e, opcionalmente, por índice parcial no banco via SQL manual).

```prisma
// ============================================================================
// DOCUMENTOS PÚBLICOS (CENTRALIZADO)
// ============================================================================

enum CategoriaMacroDocumento {
  RELATORIOS_FINANCEIROS
  RELATORIOS_GESTAO
  DOCUMENTOS_OFICIAIS
  LICITACOES_E_REGULAMENTOS
}

enum DocumentoStatusPublicacao {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum DocumentoApareceEm {
  TRANSPARENCIA
  LICITACOES
}

model Documento {
  id             String                     @id @default(uuid()) @db.Uuid
  titulo         String
  slug           String                     @unique

  categoriaMacro CategoriaMacroDocumento    @map("categoria_macro")
  subcategoria   String

  descricaoCurta String                     @db.Text @map("descricao_curta")
  orgaoEmissor   String                     @map("orgao_emissor")

  apareceEm      DocumentoApareceEm[]       @map("aparece_em")
  status         DocumentoStatusPublicacao  @default(DRAFT)
  ordemExibicao  Int                        @default(0) @map("ordem_exibicao")

  // Versão vigente (FK direta para leitura O(1))
  versaoVigenteId String?                   @unique @db.Uuid @map("versao_vigente_id")
  versaoVigente   VersaoDocumento?          @relation("VersaoVigente", fields: [versaoVigenteId], references: [id])

  versoes        VersaoDocumento[]

  createdAt      DateTime                   @default(now()) @map("created_at")
  updatedAt      DateTime                   @updatedAt @map("updated_at")

  @@index([categoriaMacro, status, ordemExibicao])
  @@index([status, updatedAt])
  @@map("documentos")
}

model VersaoDocumento {
  id                 String     @id @default(uuid()) @db.Uuid
  documentoId        String     @db.Uuid @map("documento_id")
  documento          Documento  @relation(fields: [documentoId], references: [id], onDelete: Cascade)

  numeroIdentificacao String    @map("numero_identificacao")
  versao              Int
  dataAprovacao       DateTime  @map("data_aprovacao")
  descricaoAlteracao  String?   @db.Text @map("descricao_alteracao")

  arquivoPdf          String    @map("arquivo_pdf")
  fileSize            Int       @map("file_size")
  isVigente            Boolean   @default(false) @map("is_vigente")

  createdAt           DateTime  @default(now()) @map("created_at")
  createdById         String    @map("created_by")
  createdBy           User      @relation(fields: [createdById], references: [id])

  // relação reversa (opcional) para apontamento da vigente
  vigentePara         Documento? @relation("VersaoVigente")

  @@unique([documentoId, versao])
  @@index([documentoId, isVigente])
  @@index([dataAprovacao])
  @@map("versoes_documento")
}
```

---

## 6) Organização do Admin (UX)

### Menu (único)

📂 Documentos

- Todos os Documentos
- Novo Documento

### Tela: “Todos os Documentos”

**Listagem única** (todos os documentos públicos do site).

Filtros:

- `categoria_macro`
- `status`
- `aparece_em` (transparencia / licitacoes)

Ações por item:

- Ver
- Editar metadados
- Gerenciar versões

### Tela: Documento

Blocos/abas (separação obrigatória):

1. **Metadados institucionais** (editar apenas dados do `Documento`)
2. **Aba Versões** (somente `VersaoDocumento`)
   - destaque visual para a vigente
   - ação clara: “Adicionar nova versão”
   - ação clara: “Tornar vigente” em versões históricas

**Regra:** metadados e versões **não se misturam**.

### Fluxo de uso (admin)

1. **Novo Documento (Passo 1: Metadados)**
   - titulo, slug, categoria_macro, subcategoria, descricao_curta, orgao_emissor
   - aparece_em (checkboxes)
   - status + ordem_exibicao

2. **Novo Documento (Passo 2: Upload da versão 1)**
   - numero_identificacao
   - data_aprovacao
   - arquivo_pdf
   - ao concluir: cria `VersaoDocumento (versao = 1, is_vigente = true)` e seta `Documento.versao_vigente_id`

3. **Documento existente → Aba Versões → Adicionar nova versão**
   - cria `VersaoDocumento (versao = N+1, is_vigente = true)`
   - automaticamente desativa a vigente anterior

---

## 7) Comportamento do frontend (consumo)

### Regra

O frontend consome apenas:

- `Documento.status = published`
- `Documento.versao_vigente_id` resolvida com a `VersaoDocumento` vigente

### /transparencia

- Filtra por `aparece_em` contendo `transparencia`
- Agrupa por `categoria_macro`
- Cada grupo vira um box

### /licitacao/regulamento

- Filtra por `aparece_em` contendo `licitacoes`
- Organiza por `subcategoria` (Regulamento / Modelos / Termos)

---

## 8) Estrutura de API

### API Pública (somente leitura)

1. `GET /api/public/documentos?aparece_em=transparencia`
   - retorna lista com `versao_vigente`

2. `GET /api/public/documentos?aparece_em=licitacoes`

3. `GET /api/public/documentos/:slug`
   - retorna documento (se published) + versão vigente

Resposta (modelo mental):

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "titulo": "Relatório de Gestão 2024",
      "slug": "relatorio-gestao-2024",
      "categoria_macro": "RELATORIOS_GESTAO",
      "subcategoria": "Relatórios anuais",
      "descricao_curta": "...",
      "orgao_emissor": "Diretoria Executiva",
      "aparece_em": ["TRANSPARENCIA"],
      "status": "PUBLISHED",
      "ordem_exibicao": 0,
      "versao_vigente": {
        "id": "...",
        "versao": 2,
        "numero_identificacao": "DIR_EXEC 001/2025",
        "data_aprovacao": "2025-01-15T00:00:00.000Z",
        "arquivo_pdf": "/uploads/documents/...pdf",
        "file_size": 3145728
      }
    }
  ]
}
```

### API Admin

1. `GET /api/admin/documentos`
   - filtros: `categoria_macro`, `status`, `aparece_em`, `search`

2. `POST /api/admin/documentos`
   - cria **apenas metadados** do `Documento`

3. `PATCH /api/admin/documentos/:id`
   - edita **apenas metadados**

4. `GET /api/admin/documentos/:id/versoes`

5. `POST /api/admin/documentos/:id/versoes`
   - cria nova versão
   - em transação:
     - `updateMany` para desativar `is_vigente` atual
     - cria a versão nova com `is_vigente = true`
     - atualiza `Documento.versao_vigente_id`

6. `PATCH /api/admin/documentos/:id/versoes/:versionId/tornar-vigente`
   - promove versão histórica para vigente (mesma transação)

7. `GET /api/admin/documentos/:id/versoes/:versionId/download`

---

## 9) Boas práticas (anti-duplicação e anti-bagunça)

### Anti-duplicação de documento (entidade)

- Slug único com fallback automático (`-2`, `-3`…)
- Checagem de similares antes de criar:
  - por `titulo` (contains/ILIKE)
  - por `categoria_macro`
  - por `orgao_emissor` (opcional)

### Anti-duplicação de PDF (arquivo)

Mínimo recomendável (sem overengineering):

- O upload retorna `arquivo_pdf` (path) e `file_size`.
- Ao subir um novo PDF, o admin executa `check-duplicate` por:
  - `arquivo_pdf` igual (mesmo path), ou
  - (recomendado) hash SHA-256 calculado no momento do upload e salvo como campo opcional.

Se adotar hash (recomendado), a regra fica simples:

- `UNIQUE(arquivo_hash)` em todas as versões ⇒ nunca duplica upload.

### Anti-bagunça estrutural

- Não criar “módulos” ou “tipos” paralelos de documento.
- Não associar documento diretamente a páginas/rotas.
- `aparece_em` é o único “vínculo” de exibição e é intencionalmente pequeno.
- `subcategoria` é string livre e serve só para organização de blocos (ex.: regulamento/modelos/termos).
- Metadados e versões sempre separados no admin.

---

## 10) Plano de migração a partir do schema atual do projeto

O schema atual do projeto (Prisma) já tem `Document`/`DocumentVersion`, porém:

- `Document` guarda arquivo (filePath/fileName/fileSize/fileType), o que viola a frase-âncora.
- `DocumentVersion` funciona como “histórico de substituição”, não como fonte do PDF vigente.
- Há taxonomia `DocumentArea`/`DocumentCategory` e `module`, que aumentam acoplamento/complexidade.

Migração segura (incremental):

1. Criar novas tabelas `documentos` e `versoes_documento` (sem remover as antigas de imediato).
2. Backfill:
   - Para cada `documents` existente relevante ao público, criar um `documentos`.
   - Criar `versoes_documento` v1 apontando para o `filePath` atual.
   - Setar `versao_vigente_id`.
3. Ajustar APIs públicas para ler do modelo novo.
4. Ajustar admin para usar apenas o modelo novo.
5. Desativar gradualmente o uso de `DocumentArea`/`DocumentCategory` e do arquivo dentro de `Document`.
6. Só então remover/arquivar o schema antigo (quando não houver mais leituras).

---

**Versão:** 2.0

**Data:** 23/12/2025
