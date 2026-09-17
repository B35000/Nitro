module.exports = {
  apps: [
    {
      name: "opus-mt",
      script: "venv/bin/uvicorn",
      args: "app:app --host 127.0.0.1 --port 8000",
      interpreter: "none",
      cwd: "/root/Nitro/translate",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "30s",
      listen_timeout: 30_000,
      kill_timeout: 20_000,
      env: {
        // HF_TOKEN: "hf_...",   // silences the rate-limit warning if you want
        OMP_NUM_THREADS: "1",    // cap CPU threads so torch doesn't hog the box
      },
    },
  ],
};