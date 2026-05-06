module.exports = {
  apps: [
    {
      name: 'lucky-club-master',
      script: 'npx',
      args: 'vite preview --host --port 3000',
      env: { NODE_ENV: 'production', PORT: 3000 },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
