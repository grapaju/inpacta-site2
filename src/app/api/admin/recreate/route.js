import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function GET() {
  const prisma = new PrismaClient()
  
  try {
    // Deletar admin antigo se existir
    await prisma.user.deleteMany({
      where: { email: 'admin@inpacta.org.br' }
    })
    
    // Criar novo admin com bcryptjs
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@inpacta.org.br',
        password: hashedPassword,
        name: 'Administrador INPACTA',
        role: 'ADMIN'
      }
    })
    
    return Response.json({ 
      message: 'Admin recriado com bcryptjs!',
      email: 'admin@inpacta.org.br',
      password: 'admin123'
    })
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}