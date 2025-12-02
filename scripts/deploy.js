const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function loadEnv(envPath) {
  try {
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split(/\r?\n/).filter(Boolean);
    const env = {};
    for (const line of lines) {
      const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/i);
      if (!match) continue;
      let [, key, val] = match;
      // Remove aspas ao redor, se houver
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
    return env;
  } catch (e) {
    console.warn('Não foi possível ler .env.production:', e.message);
    return {};
  }
}

function validateRequiredEnv(env) {
  const required = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
  const missingFromFile = required.filter((k) => !env[k] || String(env[k]).trim() === '');
  const missingOverall = required.filter((k) => {
    const fileVal = env[k];
    const procVal = process.env[k];
    return (!fileVal || String(fileVal).trim() === '') && (!procVal || String(procVal).trim() === '');
  });

  if (missingOverall.length) {
    console.error(`\nErro: variáveis obrigatórias ausentes -> ${missingOverall.join(', ')}`);
    console.error('Defina em `.env.production` ou nas variáveis do Projeto NodeJS (aaPanel).');
    console.error('\nExemplos:');
    console.error('  DATABASE_URL=postgresql://usuario:senha@host:5432/nome_do_banco');
    console.error('  NEXTAUTH_URL=https://seu-dominio.com');
    console.error('  NEXTAUTH_SECRET=uma_chave_segura_grande');
    console.error('\nNo aaPanel: Projeto NodeJS -> Configurar -> Variáveis de Ambiente.');
    process.exit(1);
  }

  if (missingFromFile.length) {
    console.warn(`\nAviso: faltando no arquivo .env.production -> ${missingFromFile.join(', ')}`);
    console.warn('Prosseguindo porque estão presentes no ambiente de execução (aaPanel).');
  }
}

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function main() {
  try {
    // Validação de variáveis de ambiente
    const envPath = path.resolve(process.cwd(), '.env.production');
    const env = loadEnv(envPath);
    validateRequiredEnv(env);

    // Instala dependências com lockfile
    run('npm ci');

    // Gera cliente Prisma e aplica migrações
    run('npm run db:migrate');

    // Build de produção (Next standalone já configurado)
    run('npm run build');

    // Seed opcional (não falhar se ausente)
    try { run('npm run db:seed'); } catch (e) { console.log('Seed pulado ou falhou, seguindo.'); }

    // Iniciar ou reiniciar PM2
    try {
      // Tenta iniciar pela primeira vez
      run('pm2 start scripts/pm2.config.js --env production');
    } catch (e) {
      console.log('PM2 já em execução? Tentando reiniciar.');
      run('pm2 restart inpacta-site');
    }

    // Salvar estado do PM2 para iniciar on boot
    try { run('pm2 save'); } catch (e) { console.log('Não foi possível salvar estado PM2.'); }

    console.log('\nDeploy concluído com sucesso.');
  } catch (err) {
    console.error('\nFalha no deploy:', err.message);
    process.exit(1);
  }
}

main();
