#!/usr/bin/env node
/**
 * SIDE Builder dev server
 * - Serves src/ui/ as static files at http://localhost:3000
 * - POST /run       → writes .side file, spawns `npx playwright test`, returns { runId }
 * - GET  /run/:id/stream → SSE stream of test output
 * - POST /run/:id/stop   → SIGTERM the process
 */

const http = require('http')
const fs   = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const PORT         = process.env.PORT || 3001
const UI_DIR       = __dirname
const PROJECT_ROOT = path.resolve(__dirname, '../..')
const FIXTURES_DIR = path.join(PROJECT_ROOT, 'fixtures')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.side': 'application/json',
}

// Active runs: runId → { proc, listeners[], sideFile, buffer[] }
const runs = new Map()

// ── Static file server ────────────────────────────────────────────────────
function serveFile(res, filePath) {
  try {
    const content = fs.readFileSync(filePath)
    const ext = path.extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' })
    res.end(content)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('404 Not Found')
  }
}

// ── Request body helper ───────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end',  () => resolve(body))
    req.on('error', reject)
  })
}

// ── Strip ANSI escape codes ───────────────────────────────────────────────
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*[mGKHF]/g, '')
}

// ── HTTP server ───────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  const url     = new URL(req.url, `http://localhost:${PORT}`)
  const pathname = url.pathname

  // ── POST /run ─────────────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/run') {
    let body
    try {
      body = JSON.parse(await readBody(req))
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid JSON body' }))
      return
    }

    if (!body.id || !Array.isArray(body.tests) || !Array.isArray(body.suites)) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid .side project (missing id, tests or suites)' }))
      return
    }

    const runId    = Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
    const sideFile = path.join(FIXTURES_DIR, `run_${runId}.side`)

    fs.mkdirSync(FIXTURES_DIR, { recursive: true })
    fs.writeFileSync(sideFile, JSON.stringify(body, null, 2))

    const run = { listeners: [], sideFile, buffer: [], proc: null }
    runs.set(runId, run)

    const emit = (event) => {
      const line = `data: ${JSON.stringify(event)}\n\n`
      run.buffer.push(line)
      run.listeners.forEach(fn => fn(line))
    }

    const proc = spawn('npx', ['playwright', 'test'], {
      cwd: PROJECT_ROOT,
      env: { ...process.env, SIDE_FILE: sideFile, FORCE_COLOR: '0', NO_COLOR: '1' },
      shell: true,
    })
    run.proc = proc

    proc.stdout.on('data', chunk => emit({ type: 'output', data: stripAnsi(chunk.toString()) }))
    proc.stderr.on('data', chunk => emit({ type: 'output', data: stripAnsi(chunk.toString()) }))
    proc.on('close', code => {
      emit({ type: 'done', code: code ?? 1 })
      setTimeout(() => {
        try { fs.unlinkSync(sideFile) } catch { /* already gone */ }
        runs.delete(runId)
      }, 60_000)
    })

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ runId }))
    return
  }

  // ── GET /run/:id/stream (SSE) ─────────────────────────────────────────
  const streamMatch = pathname.match(/^\/run\/([^/]+)\/stream$/)
  if (req.method === 'GET' && streamMatch) {
    const run = runs.get(streamMatch[1])
    if (!run) { res.writeHead(404); res.end(); return }

    res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    })
    res.write('retry: 1000\n\n')

    // Replay buffered events for late-joining clients
    run.buffer.forEach(line => res.write(line))

    const send = (line) => res.write(line)
    run.listeners.push(send)
    req.on('close', () => {
      run.listeners = run.listeners.filter(fn => fn !== send)
    })
    return
  }

  // ── POST /run/:id/stop ────────────────────────────────────────────────
  const stopMatch = pathname.match(/^\/run\/([^/]+)\/stop$/)
  if (req.method === 'POST' && stopMatch) {
    const run = runs.get(stopMatch[1])
    if (run?.proc) {
      run.proc.kill('SIGTERM')
      setTimeout(() => { try { run.proc.kill('SIGKILL') } catch {} }, 3000)
    }
    res.writeHead(200); res.end()
    return
  }

  // ── Static files ──────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const filePath = pathname === '/'
      ? path.join(UI_DIR, 'index.html')
      : path.join(UI_DIR, pathname.replace(/^\//, ''))
    serveFile(res, filePath)
    return
  }

  res.writeHead(405); res.end()
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  SIDE Builder  →  http://localhost:${PORT}\n`)
})

process.on('SIGTERM', () => { server.close(); process.exit(0) })
process.on('SIGINT',  () => { server.close(); process.exit(0) })
