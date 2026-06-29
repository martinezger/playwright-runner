# Runner API

The TypeScript runner lives in `src/` and is consumed by
`tests/side-runner.spec.ts`.  You can also import it directly for custom
integrations.

## `loadSideFile` — `src/loader.ts`

```typescript
import { loadSideFile } from './src/loader'

const project = loadSideFile('fixtures/example.side')
```

Reads and JSON-parses a `.side` file, validates the presence of `id`, `tests`,
and `suites`, and returns a `ProjectShape`.  Throws if the file is missing or
the JSON is invalid.

## `runTest` — `src/runner.ts`

```typescript
import { runTest } from './src/runner'

const softFailures = await runTest(page, test, project, variables, baseUrl, opts)
```

Executes all commands of a `TestShape` linearly against a Playwright `Page`.

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `page` | `Page` | Active Playwright page |
| `test` | `TestShape` | The test to execute |
| `project` | `ProjectShape` | Parent project (for global timeout/delay) |
| `variables` | `Variables` | Variable store (fresh instance per test) |
| `baseUrl` | `string` | Base URL prepended to relative `open` paths |
| `opts` | `RunTestOptions` | Optional `{ delay?: number }` override |

### Return value

Returns `Promise<string[]>` — an array of soft failure messages collected from
`verify*` commands.  If any are present the caller should fail the test.

### Error behaviour

- **Hard failures** (`assert*` commands) throw immediately and abort the test.
- **Soft failures** (`verify*` commands) are appended to the return array and
  execution continues.
- Unknown command names log a warning and are skipped.
- Commands with `skip: true` are silently skipped.

## `Variables` — `src/variables.ts`

```typescript
import { Variables } from './src/variables'

const vars = new Variables()
vars.set('username', 'alice')
vars.get('username')                     // → 'alice'
vars.interpolate('Hello, ${username}!')  // → 'Hello, alice!'
```

### Methods

| Method | Description |
|---|---|
| `set(name, value)` | Store a value |
| `get(name)` | Retrieve a value (`undefined` if not set) |
| `has(name)` | Check existence |
| `interpolate(str)` | Replace all `${name}` tokens in a string |
| `clone()` | Return a deep copy of the current store |

## `resolveLocator` — `src/locator.ts`

```typescript
import { resolveLocator } from './src/locator'

const locator = resolveLocator(page, 'id=submit')
await locator.click()
```

Converts a Selenium-style locator string to a Playwright `Locator`.

### `resolveLocatorWithFallback`

```typescript
resolveLocatorWithFallback(page, primary, targets?)
```

Tries `primary` first.  If `targets` is provided (from `CommandShape.targets`),
iterates through each entry and returns the first `Locator` that resolves.

## Type reference — `src/types.ts`

### `ProjectShape`

```typescript
interface ProjectShape {
  id: string
  version: '1.0' | '1.1' | '2.0' | '3.0'
  name: string
  url: string
  urls: string[]
  timeout?: number
  delay?: number
  plugins: string[]
  tests: TestShape[]
  suites: SuiteShape[]
}
```

### `TestShape`

```typescript
interface TestShape {
  id: string
  name: string
  commands: CommandShape[]
}
```

### `SuiteShape`

```typescript
interface SuiteShape {
  id: string
  name: string
  persistSession: boolean
  parallel: boolean
  timeout: number
  tests: string[]   // ordered test IDs
}
```

### `CommandShape`

```typescript
interface CommandShape {
  id: string
  command: string
  target?: string
  value?: string
  targets?: [string, string][]
  comment?: string
  skip?: boolean
  opensWindow?: boolean
  windowHandleName?: string
  windowTimeout?: number
}
```

### `CommandContext` — `src/commands/types.ts`

Passed to every command handler:

```typescript
interface CommandContext {
  page:         Page
  command:      CommandShape
  variables:    Variables
  baseUrl:      string
  project:      ProjectShape
  softFailures: string[]
  options:      RunnerOptions   // { delay: number }
}
```

### `CommandHandler`

```typescript
type CommandHandler = (ctx: CommandContext) => Promise<void>
```

Implement this interface to add custom commands and register them in
`src/commands/index.ts`:

```typescript
import { commandDispatcher } from './src/commands/index'

commandDispatcher['myCustomCommand'] = async (ctx) => {
  const text = ctx.variables.interpolate(ctx.command.target ?? '')
  await ctx.page.evaluate(t => console.log(t), text)
}
```
