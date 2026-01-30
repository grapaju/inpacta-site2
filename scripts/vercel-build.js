const { execSync } = require('child_process');

function run(cmd, options = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...options });
}

function ensureEnv() {
  const required = ['DATABASE_URL'];
  const missing = required.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
  if (missing.length) {
    console.error(`Faltando variáveis: ${missing.join(', ')}. Configure no Vercel (Project Settings → Environment Variables).`);
    process.exit(1);
  }
}

function migrateWithDirectIfPresent() {
  const direct = process.env.DATABASE_URL_DIRECT;
  if (direct && direct.trim() !== '') {
    console.log('Usando DATABASE_URL_DIRECT para migrações Prisma...');
    run(`"${process.execPath}" node_modules/.bin/prisma migrate deploy`, {
      env: { ...process.env, DATABASE_URL: direct }
    });
  } else {
    console.log('DATABASE_URL_DIRECT não definido; usando DATABASE_URL padrão para migrações.');
    run('npm run db:migrate');
  }
}

function main() {
  ensureEnv();

  // Em Vercel, as dependências já foram instaladas antes do build.
  // Aqui fazemos apenas migrações e build.
  migrateWithDirectIfPresent();
  run('npm run build');
}

main();
