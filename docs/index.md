# Playwright SIDE Runner

**Run Selenium IDE `.side` files with Playwright — and build them visually in the browser.**

Playwright SIDE Runner is a TypeScript toolkit that bridges the Selenium IDE
recording format (`.side`) with the speed and reliability of the Playwright test
engine.  It ships two things:

- A **headless runner** that loads any `.side` file and executes it through
  `@playwright/test`.
- A **drag-and-drop UI builder** served by a local Node.js server where you can
  compose, edit, and immediately run `.side` tests without touching a text editor.

```{toctree}
:maxdepth: 2
:caption: Contents

getting-started
side-format
commands
ui-builder
runner-api
```
