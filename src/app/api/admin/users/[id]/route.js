import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'inpacta-jwt-secret-2024';

function verifyToken(request) {
  // Tentar primeiro Authorization header
  const authHeader = request.headers.get('authorization');
  let token = null;
  
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Fallback para cookies (para navegador simples do VS Code)
    const cookies = request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/adminToken=([^;]+)/);
    if (tokenMatch) {
      token = tokenMatch[1];
    }
  }
  
  if (!token) {
    throw new Error('Token não fornecido');
  }
  
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded;
}

async function verifyAuth(request) {
  const decoded = verifyToken(request);
  
  // Buscar usuário para verificar se é admin
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });
  
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Acesso negado. Apenas administradores podem gerenciar usuários.');
  }
  
  return user;
}

// GET - Buscar usuário por ID
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    await verifyAuth(request);

    const user = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            news: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    
    if (error.message.includes('Token') || error.message.includes('Acesso negado')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const currentUser = await verifyAuth(request);

    const body = await request.json();
    const { name, email, password, role } = body;

    // Buscar usuário alvo
    const targetUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se não está tentando alterar seu próprio role
    if (currentUser.id === targetUser.id && role && role !== targetUser.role) {
      return NextResponse.json(
        { error: 'Você não pode alterar seu próprio nível de acesso' },
        { status: 400 }
      );
    }

    // Validações
    if (email && email !== targetUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== resolvedParams.id) {
        return NextResponse.json(
          { error: 'Email já está em uso por outro usuário' },
          { status: 400 }
        );
      }
    }

    if (role && !['ADMIN', 'EDITOR', 'AUTHOR'].includes(role)) {
      return NextResponse.json(
        { error: 'Role inválido. Use: ADMIN, EDITOR ou AUTHOR' },
        { status: 400 }
      );
    }

    // Preparar dados para atualização
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    
    // Hash nova senha se fornecida
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Senha deve ter pelo menos 6 caracteres' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    updateData.updatedAt = new Date();

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            news: true
          }
        }
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    
    if (error.message.includes('Token') || error.message.includes('Acesso negado')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir usuário
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const currentUser = await verifyAuth(request);

    // Verificar se não está tentando excluir a si mesmo
    if (currentUser.id === resolvedParams.id) {
      return NextResponse.json(
        { error: 'Você não pode excluir sua própria conta' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const targetUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
      include: {
        _count: {
          select: {
            news: true
          }
        }
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem conteúdo associado
    if (targetUser._count.news > 0) {
      return NextResponse.json(
        { error: `Este usuário tem ${targetUser._count.news} notícia(s) associada(s). Remova o conteúdo antes de excluir o usuário.` },
        { status: 400 }
      );
    }

    // Excluir usuário
    await prisma.user.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ 
      message: 'Usuário excluído com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    
    if (error.message.includes('Token') || error.message.includes('Acesso negado')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}