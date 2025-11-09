import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const checks = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: {
      NEXTAUTH_URL: Boolean(process.env.NEXTAUTH_URL),
      NEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET),
      DATABASE_URL: Boolean(process.env.DATABASE_URL),
      JWT_SECRET: Boolean(process.env.JWT_SECRET),
      NEXT_PUBLIC_BASE_URL: Boolean(process.env.NEXT_PUBLIC_BASE_URL)
    },
    database: {
      ok: false
    }
  }

  try {
    // teste rápido de conexão
    await prisma.$queryRaw`SELECT 1`;
    checks.database.ok = true
  } catch (err) {
    checks.database.ok = false
    checks.database.error = err?.message || String(err)
  }

  const status = checks.database.ok ? 200 : 500
  return NextResponse.json(checks, { status })
}
