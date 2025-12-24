# Guia de Isolamento do Admin

## 📋 Estrutura Atual e Isolamento

### ✅ O que já está isolado:

1. **Layout separado**: `/src/app/admin/layout.js` usa `AdminLayout` próprio
2. **CSS isolado**: `/src/styles/admin.css` com prefixos `.admin-*`
3. **Componentes isolados**: `/src/components/admin/` para componentes específicos
4. **Rotas separadas**: Tudo em `/admin/*` não afeta o site público

---

## 🎯 Regras de Isolamento

### 1. CSS - Sempre usar prefixo `.admin-`

```css
/* ✅ CORRETO - Isolado */
.admin-card { }
.admin-button { }
.admin-header { }

/* ❌ ERRADO - Pode afetar o site */
.card { }
.button { }
.header { }
```

### 2. Componentes - Sempre em `/src/components/admin/`

```
src/components/
  ├── admin/           ✅ Componentes do admin aqui
  │   ├── AdminLayout.jsx
  │   ├── AdminCard.jsx
  │   └── AdminTable.jsx
  └── SiteComponent.jsx  ← Componentes do site público
```

### 3. Estilos - Sempre importar em contexto admin

```javascript
// ✅ CORRETO - Importar no layout do admin
// src/app/admin/layout.js
import '@/styles/admin.css'

// ❌ ERRADO - NÃO importar no layout global
// src/app/layout.js
```

### 4. Classes Tailwind - Usar com cuidado

Tailwind é global, então:

```jsx
// ✅ CORRETO - Classes genéricas do Tailwind são OK
<div className="flex gap-4 p-6">

// ✅ MELHOR - Combinar com classes admin para especificidade
<div className="admin-container flex gap-4 p-6">

// ⚠️ CUIDADO - Não sobrescrever utilitários Tailwind globalmente
// Não fazer: @layer utilities { .flex { display: grid; } }
```

---

## 📁 Estrutura Recomendada

```
src/
├── app/
│   ├── layout.js              ← Layout do SITE (não toca no admin)
│   ├── globals.css            ← Estilos GLOBAIS do site
│   │
│   └── admin/
│       ├── layout.js          ← Layout do ADMIN (importa admin.css)
│       ├── page.js            ← Dashboard
│       ├── news/
│       ├── services/
│       └── ...
│
├── components/
│   ├── admin/                 ← Componentes APENAS do admin
│   │   ├── AdminLayout.jsx
│   │   ├── AdminComponents.jsx
│   │   └── AdminCard.jsx
│   │
│   └── Header.jsx             ← Componentes do site público
│
└── styles/
    ├── admin.css              ← Estilos APENAS do admin (prefixo .admin-)
    └── editor.css             ← Outros estilos específicos
```

---

## 🔒 Checklist de Isolamento

Ao criar algo novo no admin, verifique:

- [ ] CSS usa prefixo `.admin-*`?
- [ ] Componente está em `/components/admin/`?
- [ ] Página está em `/app/admin/*`?
- [ ] Não importa CSS do admin no layout global?
- [ ] Não sobrescreve classes globais do Tailwind?
- [ ] Testou que o site público ainda funciona?

---

## 🚀 Como Adicionar Nova Funcionalidade Admin

### 1. Criar Página

```bash
# Criar nova página admin
src/app/admin/minha-funcionalidade/page.js
```

### 2. Criar Componente (se necessário)

```bash
# Criar componente específico
src/components/admin/MinhaFuncionalidade.jsx
```

### 3. Adicionar Estilos (se necessário)

```css
/* src/styles/admin.css */

/* Sempre com prefixo .admin- */
.admin-minha-funcionalidade {
  /* estilos aqui */
}

.admin-minha-funcionalidade__title {
  /* BEM notation para sub-elementos */
}
```

### 4. Adicionar ao Menu (opcional)

```jsx
// src/components/admin/AdminLayout.jsx

const navigation = [
  // ... outros itens
  {
    name: 'Minha Funcionalidade',
    href: '/admin/minha-funcionalidade',
    icon: <svg>...</svg>
  }
]
```

---

## ⚠️ O que NUNCA fazer

### ❌ NÃO importar admin.css no layout global

```javascript
// ❌ ERRADO - src/app/layout.js
import '@/styles/admin.css'  // NÃO FAZER!
```

### ❌ NÃO usar classes sem prefixo

```css
/* ❌ ERRADO - src/styles/admin.css */
.card { }        /* Pode afetar o site */
.button { }      /* Pode afetar o site */
```

### ❌ NÃO colocar componentes admin fora de `/admin`

```
❌ ERRADO:
src/components/AdminCard.jsx  ← Mistura com componentes do site

✅ CORRETO:
src/components/admin/AdminCard.jsx
```

### ❌ NÃO sobrescrever estilos globais

```css
/* ❌ ERRADO - src/styles/admin.css */
body { background: red; }    /* Afeta TODO o site! */
* { box-sizing: content-box; }  /* Afeta TODO o site! */

/* ✅ CORRETO - Escopo no layout admin */
.admin-layout { background: red; }
.admin-layout * { box-sizing: border-box; }
```

---

## 🧪 Como Testar Isolamento

### 1. Teste Visual

1. Acesse o site público: `https://inpacta.org.br`
2. Verifique que está normal (sem estilos do admin)
3. Acesse o admin: `https://inpacta.org.br/admin`
4. Verifique que está com os estilos corretos

### 2. Teste de DevTools

```javascript
// No console do navegador (na página pública)
// Ver se há classes .admin-* aplicadas
document.querySelectorAll('[class*="admin-"]').length
// Deve retornar: 0 (zero)
```

### 3. Teste de Build

```bash
# Fazer build e verificar warnings
npm run build

# Verificar se há CSS não utilizado
# Verificar se há conflitos de classes
```

---

## 📚 Exemplo Completo

### Nova funcionalidade: Gerenciar Equipes

#### 1. Criar página

```jsx
// src/app/admin/teams/page.js
'use client'

import AdminTeamCard from '@/components/admin/AdminTeamCard'
import '@/styles/admin.css'  // ← Pode importar aqui também

export default function TeamsPage() {
  return (
    <div className="admin-teams-page">
      <h1 className="admin-page-title">Gerenciar Equipes</h1>
      <div className="admin-teams-grid">
        <AdminTeamCard />
      </div>
    </div>
  )
}
```

#### 2. Criar componente

```jsx
// src/components/admin/AdminTeamCard.jsx
'use client'

export default function AdminTeamCard({ team }) {
  return (
    <div className="admin-team-card">
      <h3 className="admin-team-card__title">{team.name}</h3>
      <p className="admin-team-card__description">{team.description}</p>
      <button className="admin-btn admin-btn--primary">Editar</button>
    </div>
  )
}
```

#### 3. Adicionar estilos

```css
/* src/styles/admin.css */

/* Página de equipes */
.admin-teams-page {
  padding: 2rem;
}

.admin-teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

/* Card de equipe */
.admin-team-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.admin-team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.admin-team-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.admin-team-card__description {
  color: #4a5568;
  margin-bottom: 1rem;
}
```

#### 4. Adicionar ao menu

```jsx
// src/components/admin/AdminLayout.jsx

const navigation = [
  // ... outros
  {
    name: 'Equipes',
    href: '/admin/teams',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }
]
```

---

## 🎨 Convenções de Nomenclatura

### Classes CSS

```css
/* Página */
.admin-[nome]-page { }

/* Componente */
.admin-[nome]-card { }
.admin-[nome]-table { }

/* Elemento dentro de componente (BEM) */
.admin-card__header { }
.admin-card__body { }
.admin-card__footer { }

/* Modificador (BEM) */
.admin-btn--primary { }
.admin-btn--secondary { }
.admin-card--highlighted { }

/* Estado */
.admin-card.is-active { }
.admin-btn.is-loading { }
```

### Arquivos

```
admin/
  ├── teams/
  │   ├── page.js              ← Página principal
  │   ├── [id]/
  │   │   └── page.js          ← Detalhes/edição
  │   └── new/
  │       └── page.js          ← Criar novo
```

---

## 🔧 Ferramentas Úteis

### 1. Verificar classes não utilizadas

```bash
# Instalar ferramenta
npm install -D purgecss

# Verificar CSS não utilizado no admin
npx purgecss --css src/styles/admin.css --content 'src/app/admin/**/*.{js,jsx}' 'src/components/admin/**/*.{js,jsx}'
```

### 2. Lint CSS

```bash
# Instalar stylelint
npm install -D stylelint stylelint-config-standard

# Verificar padrões CSS
npx stylelint "src/styles/admin.css"
```

---

## 📖 Recursos

- **Tailwind CSS**: Classes utilitárias globais OK
- **CSS Modules**: Alternativa (isolamento automático)
- **BEM**: Metodologia para nomenclatura
- **Styled Components**: Alternativa com CSS-in-JS

---

## ✅ Status Atual

- [x] Layout isolado (`/admin/layout.js`)
- [x] CSS com prefixos (`.admin-*`)
- [x] Componentes em pasta separada (`/components/admin/`)
- [x] Rotas separadas (`/admin/*`)
- [ ] Documentação (este arquivo)
- [ ] Testes de isolamento

---

**Próximos passos**: Sempre que criar algo novo no admin, siga este guia para manter o isolamento completo! 🚀
