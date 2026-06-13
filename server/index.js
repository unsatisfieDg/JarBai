// server/index.js
// Express backend — proxies OpenRouter API (keeps API key server-side)
// and serves the built React app in production mode.

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'JarBai Server', version: '1.0.0' });
});

// ─── Chat Proxy (streaming) ───────────────────────────────────────────────
// POST /api/chat
// Body: { model, messages, apiKey }
app.post('/api/chat', async (req, res) => {
  const { model, messages, apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'Missing apiKey' });
  }
  if (!model || !messages) {
    return res.status(400).json({ error: 'Missing model or messages' });
  }

  try {
    const upstreamRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jarbai.app',
        'X-Title': 'JarBai',
      },
      body: JSON.stringify({ model, messages, stream: true, max_tokens: 4096 }),
    });

    if (!upstreamRes.ok) {
      const err = await upstreamRes.json().catch(() => ({}));
      return res.status(upstreamRes.status).json({ error: err?.error?.message || 'OpenRouter error' });
    }

    // Pass SSE stream through
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = upstreamRes.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { res.end(); break; }
        res.write(value);
      }
    };
    pump().catch(() => res.end());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Serve React build in production ─────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`\n🤖 JarBai server running on http://localhost:${PORT}\n`);
});
