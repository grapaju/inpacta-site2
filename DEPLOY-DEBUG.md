# Deploy sem banco de dados

Para fazer o primeiro deploy sem configurar banco:

## 1. Desabilitar funcionalidades do banco temporariamente

Comentar estas linhas no middleware.js:
- Verificações de autenticação
- Redirecionamentos do admin

## 2. Configurar apenas NEXTAUTH_SECRET

```
NEXTAUTH_SECRET = 6f144d6b91dd7d340210f7638d141f2a3e24c4eda387027560c9d932d81ab5dd
```

## 3. Depois adicionar DATABASE_URL do Supabase

URL do Supabase deve ser algo como:
```
postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres
```