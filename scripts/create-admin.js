const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Verificar se já existe um admin
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    })

    if (existingAdmin) {
      console.log('✅ Usuário admin já existe:', existingAdmin.email)
      return
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Criar usuário admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@inpacta.com',
        name: 'Administrador',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('✅ Usuário administrador criado com sucesso!')
    console.log('')
    console.log('� Dados de acesso:')
    console.log('�📧 Email: admin@inpacta.com')
    console.log('🔑 Senha: admin123')
    console.log('')
    console.log('🌐 Acesse: http://localhost:3002/admin/login')
    console.log('')
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!')
    console.log('👥 No painel, você pode gerenciar outros usuários em "Usuários".')

  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()