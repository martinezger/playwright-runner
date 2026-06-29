// ── Helpers ───────────────────────────────────────────────────────────────
function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function escAttr(str) {
  return String(str ?? '').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// ── Command Definitions ───────────────────────────────────────────────────
const COMMAND_CATEGORIES = [
  {
    id: 'navigation', label: 'Navigation', color: '#7c4dff',
    commands: ['open', 'close', 'setWindowSize', 'selectFrame', 'selectWindow'],
  },
  {
    id: 'interaction', label: 'Interaction', color: '#00e5ff',
    commands: [
      'click', 'clickAt', 'doubleClick', 'doubleClickAt', 'type', 'sendKeys',
      'check', 'uncheck', 'select', 'addSelection', 'removeSelection',
      'dragAndDropToObject', 'editContent', 'submit', 'mouseOver',
      'mouseDown', 'mouseDownAt', 'mouseUp', 'mouseUpAt', 'mouseMoveAt', 'mouseOut',
    ],
  },
  {
    id: 'assertions', label: 'Assertions', color: '#ff6e40',
    commands: [
      'assert', 'assertText', 'assertTitle', 'assertValue', 'assertChecked',
      'assertNotChecked', 'assertEditable', 'assertNotEditable',
      'assertElementPresent', 'assertElementNotPresent', 'assertSelectedValue',
      'assertNotSelectedValue', 'assertSelectedLabel', 'assertNotText',
      'assertAlert', 'assertConfirmation', 'assertPrompt',
    ],
  },
  {
    id: 'verifications', label: 'Verifications', color: '#ffab40',
    commands: [
      'verify', 'verifyText', 'verifyTitle', 'verifyValue', 'verifyChecked',
      'verifyNotChecked', 'verifyEditable', 'verifyNotEditable',
      'verifyElementPresent', 'verifyElementNotPresent', 'verifySelectedValue',
      'verifyNotSelectedValue', 'verifySelectedLabel', 'verifyNotText',
    ],
  },
  {
    id: 'waits', label: 'Waits', color: '#69f0ae',
    commands: [
      'waitForElementPresent', 'waitForElementNotPresent',
      'waitForElementVisible', 'waitForElementNotVisible',
      'waitForElementEditable', 'waitForElementNotEditable',
    ],
  },
  {
    id: 'store', label: 'Store', color: '#40c4ff',
    commands: [
      'store', 'storeText', 'storeValue', 'storeTitle', 'storeAttribute',
      'storeXpathCount', 'storeWindowHandle', 'storeJson',
    ],
  },
  {
    id: 'script', label: 'Script', color: '#e040fb',
    commands: ['executeScript', 'executeAsyncScript', 'runScript', 'echo', 'pause', 'setSpeed', 'debugger'],
  },
  {
    id: 'alerts', label: 'Alerts', color: '#ff8a65',
    commands: [
      'answerOnNextPrompt', 'chooseOkOnNextConfirmation', 'chooseCancelOnNextConfirmation',
      'chooseCancelOnNextPrompt', 'webdriverAnswerOnVisiblePrompt',
      'webdriverChooseOkOnVisibleConfirmation', 'webdriverChooseCancelOnVisibleConfirmation',
      'webdriverChooseCancelOnVisiblePrompt',
    ],
  },
]

// Build lookups
const CMD_CATEGORY = {}
for (const cat of COMMAND_CATEGORIES) {
  for (const cmd of cat.commands) CMD_CATEGORY[cmd] = cat
}

// Commands where "value" field is not meaningful (hide it)
const TARGET_ONLY = new Set([
  'open', 'close', 'echo', 'pause', 'setSpeed', 'debugger',
  'assertTitle', 'verifyTitle', 'storeTitle',
  'assertAlert', 'assertConfirmation', 'assertPrompt',
  'assertElementPresent', 'assertElementNotPresent',
  'verifyElementPresent', 'verifyElementNotPresent',
  'waitForElementPresent', 'waitForElementNotPresent',
  'waitForElementVisible', 'waitForElementNotVisible',
  'waitForElementEditable', 'waitForElementNotEditable',
  'assertChecked', 'assertNotChecked', 'verifyChecked', 'verifyNotChecked',
  'assertEditable', 'assertNotEditable', 'verifyEditable', 'verifyNotEditable',
  'check', 'uncheck', 'submit', 'storeWindowHandle',
  'mouseOver', 'mouseDown', 'mouseUp', 'mouseMoveAt', 'mouseOut',
  'chooseOkOnNextConfirmation', 'chooseCancelOnNextConfirmation', 'chooseCancelOnNextPrompt',
  'webdriverChooseOkOnVisibleConfirmation', 'webdriverChooseCancelOnVisibleConfirmation',
  'webdriverChooseCancelOnVisiblePrompt',
])

// ── State ─────────────────────────────────────────────────────────────────
let project = {
  id: uuid(), version: '2.0', name: 'My Project',
  url: 'https://', urls: ['https://'], plugins: [], suites: [], tests: [],
}
let currentSuiteId = null
let currentTestId  = null
let dragState      = null  // { source: 'palette'|'canvas', command?, fromIndex? }
let dropIndex      = -1    // full-array insertion point

// ── Model Factories ───────────────────────────────────────────────────────
function createSuite(name) {
  return { id: uuid(), name, persistSession: false, parallel: false, timeout: 30000, tests: [] }
}
function createTest(name) {
  return { id: uuid(), name, commands: [] }
}
function createCommand(name) {
  return { id: uuid(), command: name, target: '', value: '', comment: '', skip: false }
}

function getCurrentSuite() { return project.suites.find(s => s.id === currentSuiteId) }
function getCurrentTest()  { return project.tests.find(t => t.id === currentTestId) }

const SERVER_URL = 'http://localhost:3000'

// ── Run State ─────────────────────────────────────────────────────────────
let activeRunId     = null
let activeEventSrc  = null
let isRunning       = false

// ── Bootstrap ─────────────────────────────────────────────────────────────
function init() {
  const suite = createSuite('Suite 1')
  const test  = createTest('Test 1')
  suite.tests.push(test.id)
  project.suites.push(suite)
  project.tests.push(test)
  currentSuiteId = suite.id
  currentTestId  = test.id

  // Header inputs
  const nameInput = document.getElementById('project-name')
  const urlInput  = document.getElementById('project-url')
  nameInput.value = project.name
  urlInput.value  = project.url
  nameInput.addEventListener('input', e => { project.name = e.target.value })
  urlInput.addEventListener('input',  e => { project.url = e.target.value; project.urls = [e.target.value] })

  // Suite / Test controls
  document.getElementById('btn-add-suite').addEventListener('click', onAddSuite)
  document.getElementById('btn-add-test').addEventListener('click',  onAddTest)

  // Run / Stop
  document.getElementById('btn-run').addEventListener('click', runTests)
  document.getElementById('btn-stop').addEventListener('click', stopTests)

  // Output panel toggle + clear
  document.getElementById('output-toggle').addEventListener('click', toggleOutputPanel)
  document.getElementById('output-clear').addEventListener('click', e => {
    e.stopPropagation()
    clearOutput()
  })

  // Export / Import
  document.getElementById('btn-export').addEventListener('click', exportSideFile)
  document.getElementById('btn-import').addEventListener('click', () => document.getElementById('import-input').click())
  document.getElementById('import-input').addEventListener('change', onImport)

  // Palette search
  document.getElementById('palette-search').addEventListener('input', e => renderPalette(e.target.value))

  // Canvas drag-and-drop
  setupCanvasDrop()

  renderAll()
}

// ── Render ────────────────────────────────────────────────────────────────
function renderAll() {
  renderSuiteTabs()
  renderSuiteSettings()
  renderTestTabs()
  renderCanvas()
  renderPalette(document.getElementById('palette-search').value)
}

function renderSuiteTabs() {
  const container = document.getElementById('suite-tabs')
  container.innerHTML = ''
  for (const suite of project.suites) {
    const tab = document.createElement('div')
    tab.className = 'tab' + (suite.id === currentSuiteId ? ' active' : '')

    const label = document.createElement('span')
    label.className = 'tab-label'
    label.contentEditable = 'true'
    label.dataset.id = suite.id
    label.textContent = suite.name
    label.addEventListener('blur', e => {
      const s = project.suites.find(x => x.id === e.target.dataset.id)
      if (s) s.name = e.target.textContent.trim() || 'Suite'
    })
    label.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); label.blur() } })

    const close = document.createElement('button')
    close.className = 'tab-close'
    close.title = 'Delete suite'
    close.textContent = '×'
    close.addEventListener('click', e => { e.stopPropagation(); deleteSuite(suite.id) })

    tab.appendChild(label)
    tab.appendChild(close)
    tab.addEventListener('click', () => selectSuite(suite.id))
    container.appendChild(tab)
  }
}

function renderSuiteSettings() {
  const suite = getCurrentSuite()
  if (!suite) return
  const ps = document.getElementById('persist-session')
  const pl = document.getElementById('parallel')
  const to = document.getElementById('suite-timeout')
  ps.checked = suite.persistSession
  pl.checked = suite.parallel
  to.value   = suite.timeout
  ps.onchange = e => { suite.persistSession = e.target.checked }
  pl.onchange = e => { suite.parallel       = e.target.checked }
  to.onchange = e => { suite.timeout        = parseInt(e.target.value) || 30000 }
}

function renderTestTabs() {
  const suite     = getCurrentSuite()
  const container = document.getElementById('test-tabs')
  container.innerHTML = ''
  if (!suite) return

  for (const testId of suite.tests) {
    const t = project.tests.find(x => x.id === testId)
    if (!t) continue

    const tab = document.createElement('div')
    tab.className = 'tab' + (t.id === currentTestId ? ' active' : '')

    const label = document.createElement('span')
    label.className = 'tab-label'
    label.contentEditable = 'true'
    label.dataset.id = t.id
    label.textContent = t.name
    label.addEventListener('blur', e => {
      const test = project.tests.find(x => x.id === e.target.dataset.id)
      if (test) test.name = e.target.textContent.trim() || 'Test'
    })
    label.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); label.blur() } })

    const count = document.createElement('span')
    count.className = 'tab-count'
    count.textContent = t.commands.length

    const close = document.createElement('button')
    close.className = 'tab-close'
    close.title = 'Delete test'
    close.textContent = '×'
    close.addEventListener('click', e => { e.stopPropagation(); deleteTest(t.id) })

    tab.appendChild(label)
    tab.appendChild(count)
    tab.appendChild(close)
    tab.addEventListener('click', () => selectTest(t.id))
    container.appendChild(tab)
  }
}

function renderCanvas() {
  const test = getCurrentTest()
  const list = document.getElementById('command-list')
  const hint = document.getElementById('drop-hint')
  list.innerHTML = ''

  if (!test || test.commands.length === 0) {
    hint.style.display = 'flex'
    return
  }
  hint.style.display = 'none'

  test.commands.forEach((cmd, index) => {
    const cat   = CMD_CATEGORY[cmd.command]
    const color = cat?.color ?? '#666666'
    const showValue = !TARGET_ONLY.has(cmd.command)

    const box = document.createElement('div')
    box.className = 'cmd-box' + (cmd.skip ? ' cmd-skipped' : '')
    box.setAttribute('draggable', 'true')
    box.dataset.index = String(index)
    box.style.setProperty('--cmd-color', color)

    box.innerHTML = `
      <div class="cmd-header">
        <span class="cmd-index">#${index + 1}</span>
        <span class="drag-handle" title="Drag to reorder">⠿</span>
        <span class="cmd-badge" style="color:${color};border-color:${color}44;background:${color}18">${escHtml(cmd.command)}</span>
        <span class="cmd-controls">
          <label class="skip-toggle" title="Skip this command">
            <input type="checkbox" class="skip-cb" data-index="${index}" ${cmd.skip ? 'checked' : ''}>
            <span>skip</span>
          </label>
          <button class="cmd-delete" data-index="${index}" title="Remove command">×</button>
        </span>
      </div>
      <div class="cmd-fields">
        <div class="cmd-field">
          <span class="field-label">Target</span>
          <input type="text" class="field-input" placeholder="locator / URL / value"
                 data-index="${index}" data-field="target" value="${escAttr(cmd.target)}">
        </div>
        ${showValue ? `
        <div class="cmd-field">
          <span class="field-label">Value</span>
          <input type="text" class="field-input" placeholder="value"
                 data-index="${index}" data-field="value" value="${escAttr(cmd.value)}">
        </div>` : ''}
        <div class="cmd-field">
          <span class="field-label">Comment</span>
          <input type="text" class="field-input field-comment" placeholder="optional comment"
                 data-index="${index}" data-field="comment" value="${escAttr(cmd.comment ?? '')}">
        </div>
      </div>
    `

    // Delete
    box.querySelector('.cmd-delete').addEventListener('click', e => {
      deleteCommand(parseInt(e.target.dataset.index))
    })

    // Skip toggle
    box.querySelector('.skip-cb').addEventListener('change', e => {
      const i = parseInt(e.target.dataset.index)
      getCurrentTest().commands[i].skip = e.target.checked
      box.classList.toggle('cmd-skipped', e.target.checked)
    })

    // Field edits
    box.querySelectorAll('.field-input').forEach(input => {
      input.addEventListener('input', e => {
        const i    = parseInt(e.target.dataset.index)
        const field = e.target.dataset.field
        getCurrentTest().commands[i][field] = e.target.value
      })
      // Prevent drag while typing in an input
      input.addEventListener('mousedown', e => e.stopPropagation())
    })

    // Drag (reorder)
    box.addEventListener('dragstart', e => {
      dragState = { source: 'canvas', fromIndex: index }
      e.dataTransfer.effectAllowed = 'move'
      requestAnimationFrame(() => box.classList.add('cmd-dragging'))
    })
    box.addEventListener('dragend', () => {
      box.classList.remove('cmd-dragging')
      clearDropIndicators()
      dragState = null
      dropIndex = -1
    })

    list.appendChild(box)
  })

  // Sync test tab counts
  renderTestTabs()
}

function renderPalette(filter = '') {
  const palette = document.getElementById('palette')
  palette.innerHTML = ''
  const q = filter.trim().toLowerCase()
  let totalVisible = 0

  for (const cat of COMMAND_CATEGORIES) {
    const filtered = q ? cat.commands.filter(c => c.toLowerCase().includes(q)) : cat.commands
    if (filtered.length === 0) continue
    totalVisible += filtered.length

    const section = document.createElement('div')
    section.className = 'palette-section'

    const catHeader = document.createElement('div')
    catHeader.className = 'palette-category'
    catHeader.style.color = cat.color
    catHeader.innerHTML = `<span class="cat-dot" style="background:${cat.color}"></span>${escHtml(cat.label)}`
    section.appendChild(catHeader)

    const chipsWrap = document.createElement('div')
    chipsWrap.className = 'palette-chips'

    for (const cmdName of filtered) {
      const chip = document.createElement('div')
      chip.className = 'palette-chip'
      chip.setAttribute('draggable', 'true')
      chip.style.setProperty('--chip-color', cat.color)
      chip.textContent = cmdName
      chip.title = `Drag or double-click to add "${cmdName}"`

      chip.addEventListener('dragstart', e => {
        dragState = { source: 'palette', command: cmdName }
        e.dataTransfer.effectAllowed = 'copy'
        chip.classList.add('chip-dragging')
      })
      chip.addEventListener('dragend', () => {
        chip.classList.remove('chip-dragging')
        if (dragState?.source === 'palette') {
          dragState = null
          dropIndex = -1
        }
      })
      chip.addEventListener('dblclick', () => addCommand(cmdName, -1))

      chipsWrap.appendChild(chip)
    }

    section.appendChild(chipsWrap)
    palette.appendChild(section)
  }

  if (totalVisible === 0) {
    palette.innerHTML = `<div class="palette-empty">No commands match "${escHtml(filter)}"</div>`
  }
}

// ── Canvas Drop Setup ─────────────────────────────────────────────────────
function setupCanvasDrop() {
  const canvas = document.getElementById('canvas')

  canvas.addEventListener('dragover', e => {
    e.preventDefault()
    if (!dragState) return
    e.dataTransfer.dropEffect = dragState.source === 'palette' ? 'copy' : 'move'

    const list  = document.getElementById('command-list')
    const boxes = [...list.querySelectorAll('.cmd-box:not(.cmd-dragging)')]
    const hint  = document.getElementById('drop-hint')
    hint.classList.add('drag-over')

    if (boxes.length === 0) {
      dropIndex = 0
      showDropIndicator(0)
      return
    }

    let visualIndex = boxes.length
    dropIndex = parseInt(boxes[boxes.length - 1].dataset.index) + 1

    for (let i = 0; i < boxes.length; i++) {
      const rect = boxes[i].getBoundingClientRect()
      if (e.clientY < rect.top + rect.height / 2) {
        visualIndex = i
        dropIndex   = parseInt(boxes[i].dataset.index)
        break
      }
    }
    showDropIndicator(visualIndex)
  })

  canvas.addEventListener('dragleave', e => {
    if (!canvas.contains(e.relatedTarget)) {
      document.getElementById('drop-hint').classList.remove('drag-over')
      clearDropIndicators()
      dropIndex = -1
    }
  })

  canvas.addEventListener('drop', e => {
    e.preventDefault()
    document.getElementById('drop-hint').classList.remove('drag-over')
    if (!dragState) return

    const test = getCurrentTest()
    if (!test) { dragState = null; return }

    const insertAt = dropIndex === -1 ? test.commands.length : dropIndex

    if (dragState.source === 'palette') {
      test.commands.splice(insertAt, 0, createCommand(dragState.command))

    } else if (dragState.source === 'canvas') {
      const from = dragState.fromIndex
      if (from !== insertAt && from + 1 !== insertAt) {
        const [cmd] = test.commands.splice(from, 1)
        const adj   = insertAt > from ? insertAt - 1 : insertAt
        test.commands.splice(Math.min(adj, test.commands.length), 0, cmd)
      }
    }

    clearDropIndicators()
    dragState = null
    dropIndex = -1
    renderCanvas()
  })
}

function showDropIndicator(visualIndex) {
  clearDropIndicators()
  const list  = document.getElementById('command-list')
  const boxes = [...list.querySelectorAll('.cmd-box:not(.cmd-dragging)')]
  const line  = document.createElement('div')
  line.className = 'drop-indicator'

  if (visualIndex >= boxes.length) {
    list.appendChild(line)
  } else {
    list.insertBefore(line, boxes[visualIndex])
  }
}

function clearDropIndicators() {
  document.querySelectorAll('.drop-indicator').forEach(el => el.remove())
}

// ── Suite Actions ─────────────────────────────────────────────────────────
function selectSuite(id) {
  currentSuiteId = id
  const suite    = getCurrentSuite()
  currentTestId  = suite ? (project.tests.find(t => t.id === suite.tests[0])?.id ?? null) : null
  renderAll()
}

function onAddSuite() {
  const suite = createSuite(`Suite ${project.suites.length + 1}`)
  const test  = createTest('Test 1')
  suite.tests.push(test.id)
  project.suites.push(suite)
  project.tests.push(test)
  currentSuiteId = suite.id
  currentTestId  = test.id
  renderAll()
}

function deleteSuite(id) {
  if (project.suites.length <= 1) return
  const suite = project.suites.find(s => s.id === id)
  if (suite) project.tests = project.tests.filter(t => !suite.tests.includes(t.id))
  project.suites = project.suites.filter(s => s.id !== id)
  if (currentSuiteId === id) {
    currentSuiteId = project.suites[0]?.id ?? null
    currentTestId  = getCurrentSuite()?.tests[0] ?? null
  }
  renderAll()
}

// ── Test Actions ──────────────────────────────────────────────────────────
function selectTest(id) {
  currentTestId = id
  renderTestTabs()
  renderCanvas()
}

function onAddTest() {
  const suite = getCurrentSuite()
  if (!suite) return
  const test = createTest(`Test ${suite.tests.length + 1}`)
  project.tests.push(test)
  suite.tests.push(test.id)
  currentTestId = test.id
  renderTestTabs()
  renderCanvas()
}

function deleteTest(id) {
  const suite = getCurrentSuite()
  if (!suite || suite.tests.length <= 1) return
  suite.tests     = suite.tests.filter(tid => tid !== id)
  project.tests   = project.tests.filter(t => t.id !== id)
  if (currentTestId === id) currentTestId = suite.tests[0] ?? null
  renderTestTabs()
  renderCanvas()
}

// ── Command Actions ───────────────────────────────────────────────────────
function addCommand(name, atIndex) {
  const test = getCurrentTest()
  if (!test) return
  const cmd = createCommand(name)
  if (atIndex === -1 || atIndex >= test.commands.length) {
    test.commands.push(cmd)
  } else {
    test.commands.splice(atIndex, 0, cmd)
  }
  renderCanvas()
}

function deleteCommand(index) {
  const test = getCurrentTest()
  if (!test) return
  test.commands.splice(index, 1)
  renderCanvas()
}

// ── Import ────────────────────────────────────────────────────────────────
function onImport(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result)
      if (!data.id || !Array.isArray(data.tests) || !Array.isArray(data.suites)) {
        throw new Error('Missing required fields: id, tests, suites')
      }
      project = {
        id:      data.id,
        version: data.version ?? '2.0',
        name:    data.name ?? 'Imported Project',
        url:     data.url ?? '',
        urls:    data.urls ?? [],
        plugins: data.plugins ?? [],
        suites:  data.suites.map(s => ({ ...s })),
        tests:   data.tests.map(t => ({
          ...t,
          commands: (t.commands ?? []).map(c => ({
            id:      c.id ?? uuid(),
            command: c.command,
            target:  c.target ?? '',
            value:   c.value ?? '',
            comment: c.comment ?? '',
            skip:    c.skip ?? false,
          })),
        })),
      }
      currentSuiteId = project.suites[0]?.id ?? null
      currentTestId  = currentSuiteId
        ? (project.tests.find(t => t.id === project.suites[0].tests[0])?.id ?? null)
        : null
      document.getElementById('project-name').value = project.name
      document.getElementById('project-url').value  = project.url
      renderAll()
    } catch (err) {
      alert('Failed to import .side file:\n' + err.message)
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

// ── Build export object (reused by both Export and Run) ───────────────────
function buildExportProject() {
  return {
    id:      project.id,
    version: project.version,
    name:    project.name,
    url:     project.url,
    urls:    project.urls,
    plugins: [],
    suites:  project.suites.map(s => ({
      id: s.id, name: s.name, persistSession: s.persistSession,
      parallel: s.parallel, timeout: s.timeout, tests: s.tests,
    })),
    tests: project.tests.map(t => ({
      id: t.id, name: t.name,
      commands: t.commands.map(c => ({
        id: c.id, command: c.command, target: c.target, value: c.value,
        ...(c.comment ? { comment: c.comment } : {}),
        ...(c.skip    ? { skip: true }          : {}),
      })),
    })),
  }
}

// ── Export ────────────────────────────────────────────────────────────────
function exportSideFile() {
  const output   = buildExportProject()
  const filename = (project.name || 'project').replace(/[^a-z0-9\-_]/gi, '_') + '.side'
  const blob     = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' })
  const url      = URL.createObjectURL(blob)
  const a        = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ── Run / Stop ────────────────────────────────────────────────────────────
async function runTests() {
  if (isRunning) return
  isRunning = true
  setRunState('running')
  clearOutput()
  appendOutput(`▶  Running "${project.name}" against ${project.url}\n`, 'info')
  openOutputPanel()

  try {
    const res = await fetch(`${SERVER_URL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildExportProject()),
    })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(error)
    }
    const { runId } = await res.json()
    activeRunId = runId

    activeEventSrc = new EventSource(`${SERVER_URL}/run/${runId}/stream`)
    activeEventSrc.onmessage = e => {
      const event = JSON.parse(e.data)
      if (event.type === 'output') {
        appendOutput(event.data)
      } else if (event.type === 'done') {
        const passed = event.code === 0
        setRunState(passed ? 'passed' : 'failed')
        appendOutput(
          passed ? '\n✓  All tests passed\n' : '\n✗  Tests failed\n',
          passed ? 'pass' : 'fail'
        )
        isRunning = false
        activeRunId = null
        activeEventSrc.close()
        activeEventSrc = null
      }
    }
    activeEventSrc.onerror = () => {
      if (!isRunning) return
      appendOutput('\n⚠  Connection to server lost.\n', 'fail')
      setRunState('failed')
      isRunning = false
    }
  } catch (err) {
    const msg = err.message.includes('fetch')
      ? 'Cannot reach the server. Run `npm run ui` to start it.'
      : err.message
    appendOutput(`\n✗  Error: ${msg}\n`, 'fail')
    setRunState('failed')
    isRunning = false
  }
}

async function stopTests() {
  if (!activeRunId) return
  try {
    await fetch(`${SERVER_URL}/run/${activeRunId}/stop`, { method: 'POST' })
  } catch { /* server might be gone */ }
  activeEventSrc?.close()
  activeEventSrc = null
  appendOutput('\n■  Run stopped by user.\n', 'info')
  setRunState('idle')
  isRunning   = false
  activeRunId = null
}

function setRunState(state) {
  const btnRun  = document.getElementById('btn-run')
  const btnStop = document.getElementById('btn-stop')
  const dot     = document.getElementById('output-status-dot')
  const summary = document.getElementById('output-summary')

  dot.className = 'output-status-dot'
  btnRun.disabled        = false
  btnRun.style.display   = ''
  btnStop.style.display  = 'none'

  if (state === 'running') {
    dot.classList.add('running')
    btnRun.disabled       = true
    btnStop.style.display = ''
    summary.textContent   = 'running…'
  } else if (state === 'passed') {
    dot.classList.add('passed')
    summary.textContent = 'passed'
  } else if (state === 'failed') {
    dot.classList.add('failed')
    summary.textContent = 'failed'
  } else {
    summary.textContent = ''
  }
}

// ── Output Panel ──────────────────────────────────────────────────────────
function appendOutput(text, type) {
  const body = document.getElementById('output-body')
  // Remove placeholder if present
  const placeholder = body.querySelector('.output-placeholder')
  if (placeholder) placeholder.remove()

  const lines = text.split('\n')
  lines.forEach((line, i) => {
    if (i > 0) body.appendChild(document.createTextNode('\n'))
    const span = document.createElement('span')
    span.className = classForLine(line, type)
    span.textContent = line
    body.appendChild(span)
  })
  body.scrollTop = body.scrollHeight
}

function classForLine(line, forceType) {
  if (forceType === 'pass') return 'line-pass'
  if (forceType === 'fail') return 'line-fail'
  if (forceType === 'info') return 'line-info'
  if (/✓|passed|PASSED/.test(line))                 return 'line-pass'
  if (/✗|failed|FAILED|Error:|error:/i.test(line))  return 'line-fail'
  if (/\d+ (passed|failed|skipped)/i.test(line))    return 'line-summary'
  return ''
}

function clearOutput() {
  const body = document.getElementById('output-body')
  body.innerHTML = '<span class="output-placeholder">Run your tests to see output here.</span>'
  setRunState('idle')
}

function openOutputPanel() {
  document.getElementById('output-panel').classList.remove('collapsed')
  document.getElementById('output-chevron').textContent = '▾'
}

function toggleOutputPanel() {
  const panel   = document.getElementById('output-panel')
  const chevron = document.getElementById('output-chevron')
  const collapsed = panel.classList.toggle('collapsed')
  chevron.textContent = collapsed ? '▸' : '▾'
}

// ── Start ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init)
