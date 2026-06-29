# Supported Commands

All commands are dispatched from `src/commands/index.ts`.  Command names are
**camelCase** and match the names stored in `.side` files.

## Navigation

| Command | `target` | `value` | Description |
|---|---|---|---|
| `open` | URL path or absolute URL | – | Navigate to `baseUrl + target` (or absolute URL) |
| `close` | – | – | Close the current page |
| `setWindowSize` | `WIDTHxHEIGHT` | – | Resize the viewport, e.g. `1280x720` |
| `selectFrame` | locator or `relative=top` | – | Switch to an iframe; `relative=top` returns to top frame |
| `selectWindow` | `handle=${var}` | – | Switch to a window by stored handle |

## Interaction

| Command | `target` | `value` | Description |
|---|---|---|---|
| `click` | locator | – | Left-click an element |
| `clickAt` | locator | `x,y` | Click at a coordinate offset inside the element |
| `doubleClick` | locator | – | Double-click |
| `doubleClickAt` | locator | `x,y` | Double-click at offset |
| `type` | locator | text | Clear and type text (supports `${KEY_ENTER}` etc.) |
| `sendKeys` | locator | text | Type without clearing first |
| `check` | locator | – | Tick a checkbox |
| `uncheck` | locator | – | Untick a checkbox |
| `select` | locator | option | Select a `<select>` option (`label=`, `value=`, `index=`) |
| `addSelection` | locator | option | Add to a multi-select |
| `removeSelection` | locator | option | Remove from a multi-select |
| `dragAndDropToObject` | source locator | target locator | HTML5 drag-and-drop |
| `editContent` | locator | HTML | Set `innerHTML` on a `contenteditable` |
| `submit` | locator | – | Submit a form |
| `mouseOver` | locator | – | Hover |
| `mouseDown` | locator | – | Press mouse button |
| `mouseDownAt` | locator | `x,y` | Press at offset |
| `mouseUp` | locator | – | Release mouse button |
| `mouseUpAt` | locator | `x,y` | Release at offset |
| `mouseMoveAt` | locator | `x,y` | Move mouse to offset |
| `mouseOut` | locator | – | Hover away (moves to `0,0`) |

### Special key tokens

Inside `type` / `sendKeys` values, use `${KEY_name}` tokens:

`KEY_ENTER`, `KEY_TAB`, `KEY_BACKSPACE`, `KEY_DELETE`, `KEY_ESCAPE`,
`KEY_UP`, `KEY_DOWN`, `KEY_LEFT`, `KEY_RIGHT`, `KEY_HOME`, `KEY_END`,
`KEY_PAGE_UP`, `KEY_PAGE_DOWN`, `KEY_F1`–`KEY_F12`, `KEY_SHIFT`,
`KEY_CTRL`, `KEY_ALT`, `KEY_META`.

## Assertions (hard — fail immediately)

| Command | `target` | `value` | Asserts |
|---|---|---|---|
| `assertTitle` | expected title | – | `document.title === target` |
| `assertText` | locator | expected | Visible text equals `value` |
| `assertNotText` | locator | unexpected | Visible text does **not** equal `value` |
| `assertValue` | locator | expected | Input value equals `value` |
| `assertChecked` | locator | – | Checkbox is checked |
| `assertNotChecked` | locator | – | Checkbox is unchecked |
| `assertEditable` | locator | – | Input is editable |
| `assertNotEditable` | locator | – | Input is not editable |
| `assertElementPresent` | locator | – | Element exists in the DOM |
| `assertElementNotPresent` | locator | – | Element does **not** exist |
| `assertSelectedValue` | locator | expected | Selected `<option>` value |
| `assertNotSelectedValue` | locator | unexpected | Selected value differs |
| `assertSelectedLabel` | locator | expected | Selected `<option>` label |
| `assert` | variable name | expected | Variable equals `value` |
| `assertAlert` | expected text | – | Next dialog message equals target |
| `assertConfirmation` | expected text | – | Next confirm dialog message |
| `assertPrompt` | expected text | – | Next prompt message |

## Verifications (soft — collect and fail at end of test)

Same commands as assertions but prefixed with `verify` instead of `assert`:

`verifyTitle`, `verifyText`, `verifyNotText`, `verifyValue`, `verifyChecked`,
`verifyNotChecked`, `verifyEditable`, `verifyNotEditable`, `verifyElementPresent`,
`verifyElementNotPresent`, `verifySelectedValue`, `verifyNotSelectedValue`,
`verifySelectedLabel`, `verify`.

Soft failures are accumulated in a list; if any exist at the end of the test, the
test fails with a combined message.

## Waits

| Command | `target` | `value` | Description |
|---|---|---|---|
| `waitForElementVisible` | locator | timeout (ms) | Wait until element is visible |
| `waitForElementNotVisible` | locator | timeout (ms) | Wait until hidden |
| `waitForElementPresent` | locator | timeout (ms) | Wait until present in DOM |
| `waitForElementNotPresent` | locator | timeout (ms) | Wait until removed |
| `waitForElementEditable` | locator | timeout (ms) | Wait until editable |
| `waitForElementNotEditable` | locator | timeout (ms) | Wait until not editable |

## Store (variable capture)

| Command | `target` | `value` | Stores |
|---|---|---|---|
| `store` | literal value | variable name | A literal string |
| `storeText` | locator | variable name | Visible text of element |
| `storeValue` | locator | variable name | Input value |
| `storeTitle` | – | variable name | `document.title` |
| `storeAttribute` | `locator@attr` | variable name | An attribute value |
| `storeXpathCount` | xpath | variable name | Number of matching nodes |
| `storeWindowHandle` | – | variable name | Current window handle |
| `storeJson` | JSON string | variable name | Parsed JSON object |

## Scripts & utilities

| Command | `target` | `value` | Description |
|---|---|---|---|
| `executeScript` | JS body | variable name | Evaluate JS; result stored in `value` |
| `executeAsyncScript` | JS body | variable name | Evaluate async JS; result stored |
| `runScript` | JS body | – | Inject a `<script>` tag |
| `echo` | message | – | Print to console |
| `pause` | milliseconds | – | Sleep for N ms |
| `setSpeed` | milliseconds | – | Set per-command delay |
| `debugger` | – | – | No-op (breakpoint hint) |

## Alerts / Dialogs

| Command | `target` | Description |
|---|---|---|
| `webdriverAnswerOnVisiblePrompt` | answer | Answer a `window.prompt` |
| `webdriverChooseOkOnVisibleConfirmation` | – | Accept next confirm dialog |
| `webdriverChooseCancelOnVisibleConfirmation` | – | Dismiss next confirm dialog |
| `chooseOkOnNextConfirmation` | – | Accept the next confirm (pending style) |
| `chooseCancelOnNextConfirmation` | – | Cancel the next confirm |
| `answerOnNextPrompt` | answer | Answer the next prompt |
