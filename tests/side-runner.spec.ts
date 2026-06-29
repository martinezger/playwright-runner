import { test, expect, BrowserContext, Page } from '@playwright/test'
import * as path from 'path'
import { loadSideFile } from '../src/loader'
import { runTest } from '../src/runner'
import { Variables } from '../src/variables'

const SIDE_FILE = process.env.SIDE_FILE ?? path.resolve(__dirname, '../fixtures/example.side')

const project = loadSideFile(SIDE_FILE)
const baseUrl = process.env.SIDE_BASE_URL ?? project.url

for (const suite of project.suites) {
  const describeFn = suite.parallel ? test.describe.parallel : test.describe

  describeFn(suite.name, () => {
    let sharedContext: BrowserContext | null = null
    let sharedPage: Page | null = null

    if (suite.persistSession) {
      test.beforeAll(async ({ browser }) => {
        sharedContext = await browser.newContext()
        sharedPage = await sharedContext.newPage()
      })

      test.afterAll(async () => {
        await sharedPage?.close()
        await sharedContext?.close()
        sharedPage = null
        sharedContext = null
      })
    }

    for (const testId of suite.tests) {
      const sideTest = project.tests.find((t) => t.id === testId)
      if (!sideTest) {
        console.warn(`[suite: ${suite.name}] Test ID "${testId}" not found in project — skipping`)
        continue
      }

      test(sideTest.name, async ({ page, browser }) => {
        let activePage: Page

        if (suite.persistSession && sharedPage) {
          activePage = sharedPage
        } else {
          activePage = page
        }

        const variables = new Variables()
        const softFailures = await runTest(
          activePage,
          sideTest,
          project,
          variables,
          baseUrl,
          { delay: project.delay }
        )

        if (softFailures.length > 0) {
          const message = `Soft assertion failures:\n${softFailures.map((f, i) => `  ${i + 1}. ${f}`).join('\n')}`
          // Fail the test after all commands have run
          expect(softFailures, message).toHaveLength(0)
        }
      })
    }
  })
}
