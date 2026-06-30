# Playwright SIDE Runner

Run Selenium IDE `.side` files with Playwright — and build them visually in the browser.

## Overview

Playwright SIDE Runner is a TypeScript toolkit that bridges the Selenium IDE recording format (`.side`) with the Playwright test engine. It ships two things:

- A **headless runner** that loads any `.side` file and executes it through `@playwright/test`.
- A **drag-and-drop UI builder** served by a local Node.js server where you can compose, edit, and immediately run `.side` tests without touching a text editor.

## Requirements

- Node.js ≥ 18
- Python ≥ 3.9 *(for docs only)*

## Installation

```bash
git clone <repo-url> playwrightRunner
cd playwrightRunner
npm install
npx playwright install chromium
```

## Usage

### Run a `.side` file

```bash
# default fixture
npm test

# custom file
SIDE_FILE=path/to/your.side npx playwright test

# override base URL
SIDE_BASE_URL=https://staging.example.com npx playwright test
```

### UI Builder

```bash
npm run ui
# → http://localhost:3000
```

Drag commands from the palette onto the canvas, organise them into suites and tests, then click **▶ Run** to execute and stream live output — or **↓ Export .side** to download the file.

## Project Structure

```
.
├── src/
│   ├── types.ts          # ProjectShape / TestShape / CommandShape interfaces
│   ├── loader.ts         # .side file reader & validator
│   ├── runner.ts         # linear command execution loop
│   ├── variables.ts      # ${varName} interpolation store
│   ├── locator.ts        # Selenium → Playwright locator translation
│   ├── commands/         # ~60 command handlers (navigation, interaction, assertions, …)
│   └── ui/
│       ├── index.html    # drag-and-drop builder UI
│       ├── style.css
│       ├── app.js
│       └── server.js     # Node.js HTTP + SSE server
├── tests/
│   └── side-runner.spec.ts  # Playwright test entry point
├── fixtures/
│   └── example.side      # sample project (2 passing tests)
├── docs/                 # Sphinx documentation source
├── docs_zensical/        # Zensical-branded Sphinx documentation source
└── .github/
    └── workflows/
        └── deploy-docs.yml  # GitHub Pages deployment (Zensical docs)
```

## npm Scripts

| Script | Description |
|---|---|
| `npm test` | Run all tests in `fixtures/example.side` |
| `npm run test:ui` | Open Playwright UI mode |
| `npm run test:report` | Show last HTML report |
| `npm run ui` | Start UI builder at `http://localhost:3000` |
| `npm run docs` | Build & serve original docs at `http://localhost:8888` |git pul
| `npm run docs:zensical` | Build & serve Zensical docs at `http://localhost:8889` |

## Supported Commands

Navigation · `open` `close` `setWindowSize` `selectFrame` `selectWindow`

Interaction · `click` `type` `sendKeys` `check` `uncheck` `select` `dragAndDropToObject` `mouseOver` and more

Assertions (hard) · `assertTitle` `assertText` `assertValue` `assertElementPresent` `assertChecked` and more

Verifications (soft) · same set prefixed with `verify` — failures are collected and reported at end of test

Waits · `waitForElementVisible` `waitForElementPresent` `waitForElementEditable` and variants

Store · `store` `storeText` `storeTitle` `storeAttribute` `storeXpathCount` and more

Scripts · `executeScript` `executeAsyncScript` `echo` `pause`

Alerts · `assertAlert` `webdriverChooseOkOnVisibleConfirmation` `answerOnNextPrompt` and more

## Documentation

```bash
npm run docs # builds Sphinx and serves at http://localhost:8888
```

Docs are also automatically deployed to GitHub Pages on every push to `main` via `.github/workflows/deploy-docs.yml`.

## License

MIT
