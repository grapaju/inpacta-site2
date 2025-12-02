const { execSync } = require('child_process');

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function main() {
  try {
    // Build rápido sem instalar dependências nem migrar
    run('npm run build');

    // Reinicia o app via PM2
    try {
      run('pm2 restart inpacta-site');
    } catch (e) {
      console.log('App não encontrado no PM2. Iniciando...');
      run('pm2 start scripts/pm2.config.js --env production');
    }

    try { run('pm2 save'); } catch (e) { /* noop */ }

    console.log('\nDeploy rápido concluído.');
  } catch (err) {
    console.error('\nFalha no deploy rápido:', err.message);
    process.exit(1);
  }
}

main();
