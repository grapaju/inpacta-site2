#!/usr/bin/env node

/**
 * Script para setup de produção do INPACTA
 * Execute este script após o primeiro deploy no Vercel
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function setupProduction() {
  console.log('🚀 Iniciando setup de produção...');
  
  const prisma = new PrismaClient();
  
  try {
    // Verificar conexão com banco
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
    
    // Executar migrações
    console.log('🔄 Executando migrações...');
    
    // Verificar se já existe usuário admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@inpacta.mg.gov.br' }
    });
    
    if (existingAdmin) {
      console.log('ℹ️  Usuário admin já existe');
      return;
    }
    
    // Criar usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@inpacta.mg.gov.br',
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📧 Email: admin@inpacta.mg.gov.br');
    console.log('🔑 Senha: admin123');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    
  } catch (error) {
    console.error('❌ Erro no setup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupProduction();