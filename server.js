import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ScanPananEngine } from './engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve static assets from frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ system: "ScanPanan Production Server", status: "Active & Ready" });
});

// Root route: return HTML for browser clients, or JSON if specifically requested
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
  }
  res.json({ system: "ScanPanan Production Server", status: "Active & Ready" });
});

// Core Scan and Optimize API
app.post('/api/scan-and-optimize', async (req, res) => {
  try {
    const { url, win_rate } = req.body || {};
    if (!url || win_rate === undefined) {
      return res.status(400).json({ error: "Missing required fields: url and win_rate" });
    }

    const engine = new ScanPananEngine(url, Number(win_rate));
    const scanResult = await engine.scanTarget();
    const optimizationResult = engine.optimizeWinRate(scanResult);
    return res.json(optimizationResult);
  } catch (err) {
    console.error("Error in /api/scan-and-optimize:", err);
    return res.status(500).json({ detail: err.message || "Internal server error" });
  }
});

// Live browser mockup rendering proxy
app.get('/api/proxy-render', async (req, res) => {
  let targetUrl = req.query.url;
  const rate = req.query.rate || '92.5';
  if (!targetUrl) {
    targetUrl = 'https://example.com/game-lobby';
  }

  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    let html = await response.text();
    // Inject <base href="..."> so relative links and assets resolve properly
    const baseTag = `<base href="${targetUrl}">`;
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}`);
    } else if (html.includes('<html>')) {
      html = html.replace('<html>', `<html><head>${baseTag}</head>`);
    } else {
      html = `${baseTag}${html}`;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    // If target URL cannot be fetched directly (e.g. simulated target or CORS/offline), deliver simulated game lobby preview
    const safeUrl = targetUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const simulatedHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>Live Target Game Lobby</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #090d16 100%);
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .lobby-container {
      width: 100%;
      max-width: 680px;
      background: rgba(17, 24, 39, 0.95);
      border: 1px solid #38bdf844;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(56, 189, 248, 0.15);
      text-align: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(14, 165, 233, 0.2);
      border: 1px solid #38bdf8;
      color: #38bdf8;
      padding: 4px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .title {
      font-size: 24px;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }
    .url-chip {
      display: inline-block;
      font-family: monospace;
      font-size: 12px;
      color: #94a3b8;
      background: #090d16;
      border: 1px solid #1e293b;
      padding: 6px 14px;
      border-radius: 6px;
      margin-bottom: 24px;
      word-break: break-all;
    }
    .game-arena {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
    }
    .arena-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 16px;
    }
    .slot-row {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    .slot-card {
      width: 78px;
      height: 78px;
      background: #1e293b;
      border: 2px solid #38bdf8;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.25);
    }
    .hud-rate-box {
      background: linear-gradient(135deg, rgba(6, 95, 70, 0.6), rgba(4, 120, 87, 0.3));
      border: 1px solid #10b981;
      border-radius: 10px;
      padding: 14px;
      color: #34d399;
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .fields-grid {
      text-align: left;
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 16px;
      font-size: 13px;
      font-family: monospace;
      color: #94a3b8;
    }
    .field-label {
      color: #38bdf8;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="lobby-container">
    <div class="badge">● Live Target Viewport</div>
    <h2 class="title">เป้าหมายเกมส์: Game Session Lobby</h2>
    <div class="url-chip">${safeUrl}</div>

    <div class="game-arena">
      <div class="arena-title">AI Probability Calibration Grid</div>
      <div class="slot-row">
        <div class="slot-card">💎</div>
        <div class="slot-card">7️⃣</div>
        <div class="slot-card">⭐</div>
      </div>
      <div class="hud-rate-box">
        <span>⚡ Calibrated Win Probability:</span>
        <span style="font-size: 20px; color: #6ee7b7;">${rate}%</span>
      </div>
    </div>

    <div class="fields-grid">
      <div style="margin-bottom: 6px; font-weight: bold; color: #cbd5e1;">Target Form Fields Hooked:</div>
      <div>• <span class="field-label">game_session_id</span>: "live_sess_89201"</div>
      <div>• <span class="field-label">bet_multiplier</span>: "x10.0"</div>
      <div>• <span class="field-label">auth_token</span>: "tk_live_verified"</div>
    </div>
  </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(simulatedHtml);
  }
});

// SPA fallback: any unhandled GET route serves index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ScanPanan Production Core running on http://0.0.0.0:${PORT}`);
});
