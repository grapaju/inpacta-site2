#!/bin/bash

# ============================================
# DEPLOY DO SISTEMA DE DOCUMENTOS
# Execute este script no servidor aaPanel
# ============================================

echo "🚀 Iniciando deploy do Sistema de Documentos..."
echo ""

# 1. Navegar para o diretório do projeto
echo "📁 Navegando para o diretório do projeto..."
cd /www/wwwroot/inpacta.org.br || exit 1
echo "✅ Diretório: $(pwd)"
echo ""

# 2. Executar migração (criar tabelas)
echo "🗄️  Executando migração do Prisma..."
echo "   Criando 6 novas tabelas:"
echo "   - DocumentArea (2 áreas)"
echo "   - DocumentCategory (hierárquica)"
echo "   - Document (documento universal)"
echo "   - Bidding (licitações)"
echo "   - DocumentVersion (versionamento)"
echo "   - DocumentHistory (auditoria)"
echo ""
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Migração executada com sucesso!"
else
  echo "❌ Erro na migração. Verifique os logs acima."
  exit 1
fi
echo ""

# 3. Executar seed (popular categorias)
echo "🌱 Executando seed de categorias..."
echo "   Inserindo estrutura:"
echo "   - 2 áreas (Transparência, Licitações)"
echo "   - 12 categorias principais"
echo "   - 36 subcategorias"
echo "   Total: 48 categorias"
echo ""
npm run db:seed:documents

if [ $? -eq 0 ]; then
  echo "✅ Seed executado com sucesso!"
else
  echo "❌ Erro no seed. Verifique os logs acima."
  exit 1
fi
echo ""

# 4. Verificar dados inseridos
echo "🔍 Verificando dados inseridos..."
echo ""

echo "📊 Contando áreas:"
psql -U inpacta_user -d inpacta_db -c "SELECT COUNT(*) as total_areas FROM \"DocumentArea\";" -t
echo ""

echo "📊 Contando categorias:"
psql -U inpacta_user -d inpacta_db -c "SELECT COUNT(*) as total_categories FROM \"DocumentCategory\";" -t
echo ""

echo "📊 Áreas criadas:"
psql -U inpacta_user -d inpacta_db -c "SELECT id, slug, name FROM \"DocumentArea\";" -A -F " | "
echo ""

# 5. Build do Next.js
echo "🏗️  Executando build do Next.js..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build executado com sucesso!"
else
  echo "❌ Erro no build. Verifique os logs acima."
  exit 1
fi
echo ""

# 6. Instruções finais
echo "============================================"
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "============================================"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Reiniciar a aplicação no aaPanel:"
echo "   - Acesse: App Store > Node Project Manager"
echo "   - Localize: inpacta.org.br"
echo "   - Clique: Restart"
echo ""
echo "2. Testar API pública:"
echo "   curl https://inpacta.org.br/api/public/document-areas"
echo ""
echo "3. Verificar resposta esperada:"
echo '   {"success":true,"data":[{"id":1,"slug":"transparencia",...}]}'
echo ""
echo "============================================"
echo "📚 Documentação completa:"
echo "   - IMPLEMENTATION-STATUS.md"
echo "   - DEPLOY-DOCUMENT-SYSTEM.md"
echo "   - DOCUMENTS-ARCHITECTURE.md"
echo "============================================"
