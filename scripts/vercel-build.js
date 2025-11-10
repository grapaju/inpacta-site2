#!/usr/bin/env node
/**
 * Script de build para Vercel com fallback se DATABASE_URL não estiver definido.
 * Etapas:
 * 1. Sempre gera Prisma Client.
 * 2. Se houver DATABASE_URL, roda migrations.
 * 3. Executa next build.
 */

const { execSync } = require('node:child_process')

function run(cmd) {
  console.log(`\n[vercel-build] > ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

try {
  const hasDb = !!process.env.DATABASE_URL
  console.log('[vercel-build] Iniciando build condicional. DATABASE_URL presente?', hasDb)

  // 1. prisma generate
  run('npx prisma generate')

  // 2. migrations somente se banco configurado
  if (hasDb) {
    try {
      run('npx prisma migrate deploy')
      console.log('[vercel-build] Migrations aplicadas com sucesso.')
    } catch (err) {
      console.error('[vercel-build] ERRO em prisma migrate deploy:', err.message)
      // Decide: falhar ou continuar? Para ambiente inicial podemos continuar.
      console.warn('[vercel-build] Prosseguindo sem interromper o build.')
    }
  } else {
    console.warn('[vercel-build] DATABASE_URL ausente. Pulando migrations (deploy somente estático).')
  }

  // 3. next build
  run('npx next build')
  console.log('[vercel-build] Build concluído.')
} catch (err) {
  console.error('[vercel-build] Falha geral:', err)
  process.exit(1)
}
