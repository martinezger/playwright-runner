# UI Builder

The SIDE Builder is a browser-based drag-and-drop editor for composing `.side`
test projects, served by a built-in Node.js HTTP server.

## Starting the server

```bash
npm run ui
# → SIDE Builder  http://localhost:3000
```

Open `http://localhost:3000` in any modern browser.

## Layout

```
┌───────────────────────────────────────────────────────────────┐
│  ▶ SIDE Builder   Project ________  Base URL ___________       │
│                   [▶ Run] [■ Stop]  | [↑ Import] [↓ Export]   │
├──────────────────────────────────┬────────────────────────────┤
│  Suite ── [tab] [+]              │  Command Palette            │
│  ──────────────────────────────  │  🔍 Search…                 │
│  ☐ Persist  ☐ Parallel  ms: __  │  ── Navigation ─────────    │
│  Test ── [tab] [+]               │  open  close  …             │
│  ──────────────────────────────  │  ── Interaction ─────────   │
│  ┌────────────────────────────┐  │  click  type  …             │
│  │  canvas  (drop here)       │  │  ── Assertions ─────────    │
│  └────────────────────────────┘  │  assertTitle  …             │
│  ── Test Output ──────────────── │                             │
│  ▸ Run output streams here       │                             │
└──────────────────────────────────┴────────────────────────────┘
```

## Header controls

| Control | Description |
|---|---|
| **Project** text field | Sets `project.name` |
| **Base URL** text field | Sets `project.url` (prepended to `open` commands) |
| **▶ Run** | Serialises the current project, POSTs to the server, and streams test output |
| **■ Stop** | Sends a SIGTERM to the running Playwright process |
| **↑ Import .side** | Load an existing `.side` file into the editor |
| **↓ Export .side** | Download the current project as a `.side` JSON file |

## Suite bar

- Each suite appears as a tab; click to switch, double-click the label to rename.
- **+** creates a new suite.
- **×** on a tab deletes the suite (and un-links its tests from it).
- **Persist Session** — when checked, all tests in the suite share one browser
  context (useful for login flows).
- **Parallel** — when checked, tests in the suite run concurrently.
- **Timeout** — per-suite Playwright timeout in ms.

## Test bar

- Each test appears as a tab; click to switch, double-click the label to rename.
- **+** creates a new test and adds it to the current suite.
- **×** deletes the test.

## Canvas

The canvas displays the ordered list of commands for the currently selected test.

### Adding commands

- **Drag** a chip from the Command Palette and drop it anywhere on the canvas.
  A cyan insertion line shows the drop position.
- **Double-click** any palette chip to append the command at the end.

### Reordering commands

- **Drag** any command box to a new position within the canvas.

### Editing a command

Each command box shows:

| Part | Description |
|---|---|
| Command name | Non-editable label |
| **Target** input | Locator or first argument |
| **Value** input | Second argument |
| **Skip** toggle | Greyed-out when skipped |
| **×** button | Delete command |

### Colour coding

Each command category has a distinct left-border colour matching its palette chip.

## Command Palette

The right panel lists all ~60 supported commands grouped by category:
Navigation, Interaction, Assertions, Verifications, Waits, Store, Scripts, Alerts.

Use the search box to filter by name.

## Test Output panel

The collapsible panel at the bottom of the canvas streams live Playwright output
when a run is in progress.

| Indicator | Meaning |
|---|---|
| Blinking cyan dot | Tests are running |
| Green dot | All tests passed |
| Red dot | One or more tests failed |
| Green text | Passing lines (`✓`, `passed`) |
| Red text | Failing lines (`✗`, `failed`, `Error`) |

Click the panel header to collapse/expand it.  Click **Clear** to wipe the output.

## Server API

The UI server (`src/ui/server.js`) exposes three endpoints used internally by the
browser client.

### `POST /run`

Submit a project JSON body to start a test run.

**Request body:** a `ProjectShape` object (same format as a `.side` file).

**Response:**

```json
{ "runId": "abc123" }
```

### `GET /run/:id/stream`

Server-Sent Events stream for a running test.  Each event is a JSON-encoded
object:

```
data: {"type":"output","data":"line of stdout/stderr\n"}
data: {"type":"done","code":0}
```

`code` is the Playwright process exit code (`0` = passed).

### `POST /run/:id/stop`

Send SIGTERM to the running Playwright process.  Returns `200 OK`.
