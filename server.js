const express = require('express');
const { spawn } = require('child_process');

const app = express();
const PORT = 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let botStatus = 'starting';
let botLogs = [];

function addLog(line) {
  botLogs.push({ time: new Date().toISOString(), line });
  if (botLogs.length > 200) botLogs.shift();
}

app.get('/', (req, res) => {
  const logHtml = botLogs.slice(-50).map(l =>
    `<div>[${l.time.slice(11, 19)}] ${l.line.replace(/\x1B\[[0-9;]*m/g, '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`
  ).join('');

  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>NERO Bot</title>
  <meta http-equiv="refresh" content="10">
  <style>
    body { font-family: monospace; background: #111; color: #eee; padding: 20px; }
    h1 { color: #4caf50; }
    .status { padding: 8px 14px; border-radius: 6px; display: inline-block; margin-bottom: 16px; }
    .starting { background: #555; }
    .running { background: #2e7d32; }
    .stopped { background: #b71c1c; }
    .logs { background: #1a1a1a; padding: 12px; border-radius: 6px; height: 400px; overflow-y: auto; font-size: 13px; }
  </style>
</head>
<body>
  <h1>&#x1F916; NERO Bot Dashboard</h1>
  <div class="status ${botStatus}">${botStatus.toUpperCase()}</div>
  <p>This is a Facebook Messenger bot. Configure your credentials in <code>config.json</code> to connect.</p>
  <h3>Recent Logs:</h3>
  <div class="logs">${logHtml || '<div>Waiting for bot output...</div>'}</div>
</body>
</html>`);
});

app.get('/uptime', (req, res) => {
  res.json({ status: botStatus, uptime: process.uptime(), unit: 'seconds' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Dashboard running at http://0.0.0.0:${PORT}`);
});

function startBot() {
  botStatus = 'starting';
  addLog('[SERVER] Starting NERO bot...');

  const bot = spawn('node', ['index.js'], {
    env: { ...process.env },
    stdio: ['inherit', 'pipe', 'pipe']
  });

  bot.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    lines.forEach(line => {
      addLog(line);
      process.stdout.write(line + '\n');
    });
    if (botStatus === 'starting') botStatus = 'running';
  });

  bot.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    lines.forEach(line => {
      addLog('[ERR] ' + line);
      process.stderr.write(line + '\n');
    });
  });

  bot.on('exit', (code) => {
    botStatus = 'stopped';
    addLog(`[SERVER] Bot exited with code ${code}. Restarting in 10s...`);
    console.log(`[SERVER] Bot exited with code ${code}. Restarting in 10s...`);
    setTimeout(startBot, 10000);
  });
}

startBot();
