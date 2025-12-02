module.exports = {
  apps: [
    {
      name: 'inpacta-site',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: process.cwd(),
      env: {
        NODE_ENV: 'production'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
