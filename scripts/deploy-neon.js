const { execSync } = require('child_process');

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function ensureEnv() {
  const required = ['DATABASE_URL'];
  const missing = required.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
  if (missing.length) {
    console.error(`Faltando variáveis: ${missing.join(', ')}. Defina no aaPanel.`);
    process.exit(1);
  }
}

function migrateWithDirectIfPresent() {
  const direct = process.env.DATABASE_URL_DIRECT;
  if (direct && direct.trim() !== '') {
    console.log('Usando DATABASE_URL_DIRECT para migrações Prisma...');
    // Executa migrações com a URL direta
    execSync(`"${process.execPath}" node_modules/.bin/prisma migrate deploy`, {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: direct }
    });
  } else {
    console.log('DATABASE_URL_DIRECT não definido; usando DATABASE_URL padrão para migrações.');
    run('npm run db:migrate');
  }
}

function main() {
  ensureEnv();
  // Instala dependências e gera prisma client
  run('npm ci');

  // Migrações com conexão direta se disponível
  migrateWithDirectIfPresent();

  // Build
  run('npm run build');

  console.log('\nDeploy Neon concluído (migrações + build).');
}

main();
