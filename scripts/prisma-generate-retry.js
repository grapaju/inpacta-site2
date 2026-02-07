/*
  Workaround for occasional Windows EPERM rename errors when Prisma downloads/updates
  query_engine-windows.dll.node during `prisma generate`.

  This script retries `prisma generate` a few times with backoff.
*/

const { spawn } = require('node:child_process');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runPrismaGenerate() {
  return new Promise((resolve) => {
    const isWin = process.platform === 'win32';

    // No Windows, habilitamos `shell` para executar `npx` (bat/cmd) sem EINVAL.
    const child = spawn('npx', ['prisma', 'generate'], {
      stdio: ['inherit', 'inherit', 'pipe'],
      shell: isWin,
      env: process.env,
    });

    let stderr = '';
    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        const text = chunk.toString();
        stderr += text;
        process.stderr.write(text);
      });
    }

    child.on('close', (code) => resolve({ code: code || 0, stderr }));
  });
}

function isRetryableErrorMessage(message) {
  if (!message) return false;
  const m = String(message);
  return (
    m.includes('EPERM: operation not permitted, rename') &&
    (m.includes('query_engine-windows.dll.node') || m.includes('query_engine-windows'))
  );
}

async function main() {
  const maxAttempts = Number(process.env.PRISMA_GENERATE_RETRIES || 5);
  const baseDelayMs = Number(process.env.PRISMA_GENERATE_RETRY_DELAY_MS || 600);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await runPrismaGenerate();

    if (result.code === 0) {
      process.exit(0);
    }

    const canRetry = attempt < maxAttempts && isRetryableErrorMessage(result.stderr);
    if (!canRetry) {
      process.exit(result.code);
    }

    const delay = baseDelayMs * attempt;
    console.log(`\n[prisma-generate-retry] Tentativa ${attempt} falhou (EPERM). Repetindo em ${delay}ms...\n`);
    await sleep(delay);
  }

  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
