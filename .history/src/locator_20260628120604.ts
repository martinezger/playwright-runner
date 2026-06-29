import { Locator, Page } from '@playwright/test'

/**
 * Translates a Selenium IDE locator string to a Playwright Locator.
 *
 * Supported strategies:
 *   id=foo              → page.locator('#foo')
 *   name=foo            → page.locator('[name="foo"]')
 *   css=.foo            → page.locator('.foo')
 *   xpath=//div         → page.locator('xpath=//div')
 *   link=Click here     → page.getByRole('link', { name: 'Click here' })
 *   linkText=Click here → page.getByRole('link', { name: 'Click here' })
 *   partialLinkText=foo → page.getByRole('link', { name: /foo/ })
 *   (no prefix)         → treated as CSS selector
 */
export function resolveLocator(page: Page, raw: string): Locator {
  if (raw.startsWith('id=')) {
    const id = raw.slice(3)
    return page.locator(`#${CSS.escape(id)}`)
  }
  if (raw.startsWith('name=')) {
    const name = raw.slice(5)
    return page.locator(`[name="${name}"]`)
  }
  if (raw.startsWith('css=')) {
    return page.locator(raw.slice(4))
  }
  if (raw.startsWith('xpath=')) {
    return page.locator(`xpath=${raw.slice(6)}`)
  }
  if (raw.startsWith('//') || raw.startsWith('(//')) {
    return page.locator(`xpath=${raw}`)
  }
  if (raw.startsWith('link=') || raw.startsWith('linkText=')) {
    const text = raw.startsWith('link=') ? raw.slice(5) : raw.slice(9)
    return page.getByRole('link', { name: text, exact: true })
  }
  if (raw.startsWith('partialLinkText=')) {
    const text = raw.slice(16)
    return page.getByRole('link', { name: new RegExp(text) })
  }
  // default: CSS
  return page.locator(raw)
}

/**
 * Tries the primary target, then falls back through the targets[] array.
 * Returns the first strategy that is attached to the DOM, or the primary
 * locator if none can be verified (Playwright will fail on use).
 */
export async function resolveLocatorWithFallback(
  page: Page,
  primary: string | undefined,
  targets: [string, string][] | undefined
): Promise<Locator> {
  const candidates: string[] = []

  if (primary) candidates.push(primary)
  if (targets) {
    for (const [strategy] of targets) {
      if (strategy && !candidates.includes(strategy)) {
        candidates.push(strategy)
      }
    }
  }

  if (candidates.length === 0) {
    throw new Error('Command has no target or locator')
  }

  for (const candidate of candidates) {
    const locator = resolveLocator(page, candidate)
    const count = await locator.count()
    if (count > 0) return locator
  }

  // Return primary (or first candidate) and let Playwright surface the error
  return resolveLocator(page, candidates[0])
}
