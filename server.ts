import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn, ChildProcess, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const PY_PORT = '7682';

let pyProcess: ChildProcess | null = null;
let isShuttingDown = false;

function ensureDataDirectories() {
  const dirs = ['/data', '/data/home', '/data/work', '/data/sbuf', '/data/.local', '/data/.local/bin', '/data/.npm'];
  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch {
      // Ignore if read-only or fallback
    }
  }
}

function startPythonBackend() {
  if (isShuttingDown) return;
  ensureDataDirectories();

  const scriptPath = path.join(__dirname, 'app.py');
  console.log(`[ROOT Terminal] Launching Python backend on internal port ${PY_PORT}...`);

  pyProcess = spawn('python3', [scriptPath], {
    cwd: __dirname,
    env: {
      ...process.env,
      PY_PORT: PY_PORT,
      PORT: PY_PORT,
      TERM_USER: process.env.TERM_USER || 'yusf',
      TERM_PASS: process.env.TERM_PASS || '12345678rk',
    },
    stdio: 'inherit',
  });

  pyProcess.on('exit', (code, signal) => {
    console.warn(`[ROOT Terminal] Python backend exited (code: ${code}, signal: ${signal})`);
    if (!isShuttingDown) {
      console.log('[ROOT Terminal] Restarting Python backend in 1 second...');
      setTimeout(startPythonBackend, 1000);
    }
  });

  pyProcess.on('error', (err) => {
    console.error('[ROOT Terminal] Failed to start Python backend:', err);
  });
}

async function waitForPythonReady(retries = 25, intervalMs = 200): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PY_PORT}/manifest.json`);
      if (res.ok) {
        console.log('[ROOT Terminal] Python backend is ready.');
        return true;
      }
    } catch {
      // Still booting
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  console.warn('[ROOT Terminal] Python backend ready check timed out, proceeding anyway.');
  return false;
}

let cloudflaredProcess: ChildProcess | null = null;
let publicTunnelUrl: string = '';

function startCloudflareTunnel() {
  if (isShuttingDown) return;

  const tokenFile = '/data/tunnel_token.txt';
  const customToken = process.env.CLOUDFLARE_TOKEN || (fs.existsSync(tokenFile) ? fs.readFileSync(tokenFile, 'utf8').trim() : '');

  // Check if a cloudflared tunnel is already running to avoid regenerating URLs
  try {
    const existingPids = execSync('pgrep -f "cloudflared tunnel"', { encoding: 'utf8' }).trim();
    if (existingPids) {
      if (fs.existsSync('/data/public_tunnel_url.txt')) {
        publicTunnelUrl = fs.readFileSync('/data/public_tunnel_url.txt', 'utf8').trim();
      }
      console.log(`[ROOT Terminal] Preserving existing active Cloudflare Tunnel: ${publicTunnelUrl}`);
      return;
    }
  } catch {
    // Not running, proceed to spawn
  }

  if (customToken) {
    console.log('[ROOT Terminal] Starting Cloudflare Permanent Named Tunnel with Token...');
    cloudflaredProcess = spawn('cloudflared', [
      'tunnel',
      '--edge-ip-version', '4',
      '--protocol', 'http2',
      '--no-autoupdate',
      'run',
      '--token', customToken,
    ], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } else {
    console.log('[ROOT Terminal] Starting Cloudflare public quick tunnel...');
    cloudflaredProcess = spawn('cloudflared', [
      'tunnel',
      '--edge-ip-version', '4',
      '--protocol', 'http2',
      '--url', `http://127.0.0.1:${PORT}`,
      '--no-autoupdate',
    ], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const parseUrl = (chunk: Buffer) => {
      const text = chunk.toString();
      const match = text.match(/https:\/\/[-a-zA-Z0-9]+\.trycloudflare\.com/);
      if (match && match[0]) {
        publicTunnelUrl = match[0];
        console.log(`[ROOT Terminal] Public External URL (Unrestricted): ${publicTunnelUrl}`);
        try {
          fs.writeFileSync('/data/public_tunnel_url.txt', publicTunnelUrl);
        } catch {}
      }
    };

    cloudflaredProcess.stdout?.on('data', parseUrl);
    cloudflaredProcess.stderr?.on('data', parseUrl);
  }

  cloudflaredProcess.on('exit', (code) => {
    console.warn(`[ROOT Terminal] Cloudflare tunnel exited (code: ${code}). Restarting in 3s...`);
    if (!isShuttingDown) {
      setTimeout(startCloudflareTunnel, 3000);
    }
  });
}

function startKeepAlive() {
  console.log('[ROOT Terminal] Background Keep-Alive active (prevents sleep when browser closes)...');
  const ping = async () => {
    try {
      const hbPath = '/data/.heartbeat';
      fs.writeFileSync(hbPath, String(Date.now()));
    } catch {}

    try {
      await fetch(`http://127.0.0.1:${PORT}/health`).catch(() => {});
    } catch {}

    const appUrl = process.env.APP_URL;
    if (appUrl) {
      try {
        await fetch(appUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'ROOT-Terminal-KeepAlive/1.0' },
        }).catch(() => {});
      } catch {}
    }

    if (publicTunnelUrl) {
      try {
        await fetch(`${publicTunnelUrl}/health`, {
          method: 'GET',
          headers: { 'User-Agent': 'ROOT-Terminal-KeepAlive/1.0' },
        }).catch(() => {});
      } catch {}
    }
  };
  ping();
  setInterval(ping, 25000);
}

async function main() {
  startPythonBackend();
  await waitForPythonReady();
  startKeepAlive();
  startCloudflareTunnel();

  const app = express();

  // Python proxy middleware
  const pyProxy = createProxyMiddleware({
    target: `http://127.0.0.1:${PY_PORT}`,
    changeOrigin: true,
    ws: true,
    on: {
      error: (err: Error, req: any, res: any) => {
        console.error('[Proxy Error]:', err.message);
        if (res && typeof res.writeHead === 'function' && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ROOT Terminal backend initializing. Please refresh.' }));
        }
      },
    },
  });

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'ROOT Terminal', port: PORT, backendPort: PY_PORT });
  });

  // Public external URL endpoint (unrestricted Cloudflare Tunnel)
  app.get('/api/public-url', (req: Request, res: Response) => {
    let url = publicTunnelUrl;
    if (!url && fs.existsSync('/data/public_tunnel_url.txt')) {
      try {
        url = fs.readFileSync('/data/public_tunnel_url.txt', 'utf8').trim();
      } catch {}
    }
    res.json({
      url: url || process.env.APP_URL || '',
      tunnelUrl: url,
      appUrl: process.env.APP_URL || '',
    });
  });

  // Serve static assets from project root (icons, etc.)
  app.get(['/icon-192.png', '/icon-512.png'], (req: Request, res: Response) => {
    const file = path.join(__dirname, req.path.replace(/^\//, ''));
    if (fs.existsSync(file)) {
      res.sendFile(file);
    } else {
      pyProxy(req, res, () => res.sendStatus(404));
    }
  });

  // Direct serve for root terminal UI
  app.get(['/', '/terminal', '/ui.html'], (req: Request, res: Response) => {
    const uiPath = path.join(__dirname, 'ui.html');
    if (fs.existsSync(uiPath)) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.sendFile(uiPath);
    } else {
      pyProxy(req, res, () => res.sendStatus(404));
    }
  });

  // Forward all other routes (login, read, write, api, static) to Python without stripping path
  app.use(pyProxy);

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ROOT Terminal] Server listening on http://0.0.0.0:${PORT}`);
  });

  const shutdown = () => {
    isShuttingDown = true;
    console.log('[ROOT Terminal] Gracefully shutting down...');
    if (pyProcess) {
      try {
        pyProcess.kill('SIGTERM');
      } catch {}
    }
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[ROOT Terminal] Fatal startup error:', err);
  process.exit(1);
});
