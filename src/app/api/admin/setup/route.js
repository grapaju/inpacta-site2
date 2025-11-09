/**
 * Script simples para criar usuário admin via URL
 * Acesse: https://inpacta-site.vercel.app/api/admin/setup
 */

// Adicione esta API route temporária
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function GET() {
  const prisma = new PrismaClient()
  
  try {
    // Verificar se já existe admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@inpacta.mg.gov.br' }
    })
    
    if (existingAdmin) {
      return Response.json({ message: 'Admin já existe!' })
    }
    
    // Criar admin
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@inpacta.mg.gov.br',
        password: hashedPassword,
        name: 'Administrador INPACTA',
        role: 'ADMIN'
      }
    })
    
    return Response.json({ 
      message: 'Admin criado com sucesso!',
      email: 'admin@inpacta.mg.gov.br',
      password: 'admin123'
    })
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}