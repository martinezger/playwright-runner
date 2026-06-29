# .side File Format

A `.side` file is plain JSON that follows the schema defined by
`@seleniumhq/side-model`.  The runner mirrors this schema in
`src/types.ts`.

## Top-level structure — `ProjectShape`

```js
{
  "id":      "<uuid>",
  "version": "2.0",
  "name":    "My Project",
  "url":     "https://example.com",
  "urls":    ["https://example.com"],
  "plugins": [],
  "suites":  [ /* SuiteShape */ ],
  "tests":   [ /* TestShape */ ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✓ | UUID uniquely identifying the project |
| `version` | `"1.0"` \| `"2.0"` \| `"3.0"` | ✓ | File format version |
| `name` | `string` | ✓ | Human-readable project name |
| `url` | `string` | ✓ | Default base URL prepended to all `open` commands |
| `urls` | `string[]` | ✓ | All base URLs used by this project |
| `timeout` | `number` | – | Global command timeout in ms |
| `delay` | `number` | – | Milliseconds to pause between each command |
| `plugins` | `string[]` | ✓ | Plugin list (may be empty) |
| `suites` | `SuiteShape[]` | ✓ | Ordered list of test suites |
| `tests` | `TestShape[]` | ✓ | All tests (suites reference them by ID) |

## Suite — `SuiteShape`

```js
{
  "id":             "<uuid>",
  "name":           "Smoke",
  "persistSession": false,
  "parallel":       false,
  "timeout":        30000,
  "tests":          ["<test-uuid>" /* ... */]
}
```

| Field | Type | Description |
|---|---|---|
| `persistSession` | `boolean` | Share one browser context across all tests in the suite |
| `parallel` | `boolean` | Run tests concurrently (`test.describe.parallel`) |
| `timeout` | `number` | Per-suite timeout in ms |
| `tests` | `string[]` | Ordered list of test IDs belonging to this suite |

## Test — `TestShape`

```js
{
  "id":       "<uuid>",
  "name":     "Homepage loads",
  "commands": [ /* CommandShape */ ]
}
```

## Command — `CommandShape`

```json
{
  "id":      "<uuid>",
  "command": "click",
  "target":  "css=button#submit",
  "value":   "",
  "comment": "optional note",
  "skip":    false
}
```

| Field | Type | Description |
|---|---|---|
| `command` | `string` | Command name (camelCase, see [Commands](commands.md)) |
| `target` | `string` | Primary locator or argument |
| `value` | `string` | Secondary argument (e.g. text to type, option to select) |
| `targets` | `[string, string][]` | Fallback locator list — tried in order when primary fails |
| `skip` | `boolean` | When `true` the command is silently skipped |
| `comment` | `string` | Free-text annotation |
| `opensWindow` | `boolean` | Hint that the command opens a new window |
| `windowHandleName` | `string` | Variable name to store the new window handle |

## Locator syntax

The `target` field of a command uses Selenium-style locator strings.

| Prefix | Example | Playwright equivalent |
|---|---|---|
| `id=` | `id=username` | `page.locator('#username')` |
| `name=` | `name=email` | `page.locator('[name="email"]')` |
| `css=` | `css=.btn-primary` | `page.locator('.btn-primary')` |
| `xpath=` | `xpath=//button` | `page.locator('//button')` |
| `//` | `//h1` | `page.locator('//h1')` (auto-detected XPath) |
| `link=` | `link=Sign in` | `page.getByRole('link', { name: 'Sign in' })` |
| `linkText=` | `linkText=Sign in` | same as `link=` |
| `partialLinkText=` | `partialLinkText=Sign` | `page.getByRole('link', { name: /Sign/i })` |
| *(none)* | `.btn-primary` | treated as CSS selector |

When the primary locator fails and `targets` contains additional entries, the
runner tries each in order until one resolves.

## Variable interpolation

Any `target` or `value` that contains `${varName}` is interpolated at runtime
from the current variable store (populated by `store*` commands).

```json
{ "command": "type", "target": "id=greeting", "value": "Hello, ${username}!" }
```
