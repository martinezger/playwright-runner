import { Page } from '@playwright/test'
import { TestShape, ProjectShape } from './types'
import { Variables } from './variables'
import { commandDispatcher, RunnerOptions } from './commands/index'
import { CommandContext } from './commands/types'

export interface RunTestOptions {
  delay?: number
}

/**
 * Runs all commands in a TestShape linearly against the given Playwright page.
 * Returns an array of soft failure messages (from verify* commands).
 * Throws on hard assertion failures (assert* commands) or unhandled errors.
 */
export async function runTest(
  page: Page,
  test: TestShape,
  project: ProjectShape,
  variables: Variables,
  baseUrl: string,
  opts: RunTestOptions = {}
): Promise<string[]> {
  const softFailures: string[] = []
  const options: RunnerOptions = {
    delay: opts.delay ?? project.delay ?? 0,
  }

  for (const command of test.commands) {
    if (command.skip) continue

    const handler = commandDispatcher[command.command]

    if (!handler) {
      console.warn(`[runner] Unknown command "${command.command}" — skipping`)
      continue
    }

    const ctx: CommandContext = {
      page,
      command,
      variables,
      baseUrl,
      project,
      softFailures,
      options,
    }

    await handler(ctx)

    if (options.delay > 0) {
      await page.waitForTimeout(options.delay)
    }
  }

  return softFailures
}
