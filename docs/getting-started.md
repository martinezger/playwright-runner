# Getting Started

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18 |
| Python | ≥ 3.9 (for docs only) |

## Installation

```bash
git clone <repo-url> playwrightRunner
cd playwrightRunner
npm install
npx playwright install chromium
```

## Running a `.side` file

Point `SIDE_FILE` at any Selenium IDE project file and run the Playwright test suite:

```bash
SIDE_FILE=fixtures/example.side npx playwright test
# or using the npm script
npm test
```

The runner discovers all **suites** and **tests** inside the file, generates
`test.describe` / `test` blocks on the fly, and streams results through the
standard Playwright reporter.

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `SIDE_FILE` | `fixtures/example.side` | Path to the `.side` project file |
| `SIDE_BASE_URL` | value from `.side` file | Override the project base URL |

## Using the UI Builder

Start the local server and open the builder in your browser:

```bash
npm run ui
# → http://localhost:3000
```

From there you can:

- Drag commands from the **Command Palette** onto the canvas.
- Organise commands into **Suites** and **Tests**.
- Click **▶ Run** to execute the current project via Playwright and watch live
  output stream into the output panel.
- Click **↓ Export .side** to download the project as a `.side` file that any
  Selenium IDE-compatible tool can open.

## Building the docs

```bash
npm run docs
```

This command builds the HTML documentation with Sphinx and immediately serves it
on `http://localhost:8888`.  Leave the process running and refresh the browser to
see changes after you re-run the build.
