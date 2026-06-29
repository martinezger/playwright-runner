import { expect } from '@playwright/test'
import { CommandContext } from './types'
import { resolveLocatorWithFallback } from '../locator'

type AssertFn = (ctx: CommandContext) => Promise<void>

/**
 * Wraps an assertion function:
 * - For assert* commands: throws on failure (stops test)
 * - For verify* commands: catches failure, pushes to softFailures (test continues)
 */
function makeAssertion(fn: AssertFn, soft: boolean): AssertFn {
  if (!soft) return fn
  return async (ctx) => {
    try {
      await fn(ctx)
    } catch (e) {
      ctx.softFailures.push((e as Error).message)
    }
  }
}

// --- Core assertion implementations ---

async function assertTextImpl(ctx: CommandContext): Promise<void> {
  const { page, command, variables } = ctx
  const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
  const expected = variables.interpolate(command.value ?? '')
  await expect(locator).toContainText(expected)
}

async function assertTitleImpl(ctx: CommandContext): Promise<void> {
  const { page, command, variables } = ctx
  const expected = variables.interpolate(command.target ?? '')
  await expect(page).toHaveTitle(new RegExp(escapeRegex(expected)))
}

async function assertValueImpl(ctx: CommandContext): Promise<void> {
  const { page, command, variables } = ctx
  const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
  const expected = variables.interpolate(command.value ?? '')
  await expect(locator).toHaveValue(expected)
}

async function assertCheckedImpl(ctx: CommandContext): Promise<void> {
  const { page, command, variables } = ctx
  const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
  await expect(locator).toBeChecked()
}

async function assertNotCheckedImpl(ctx: CommandContext): Promise<void> {
  const { page, command, variables } = ctx
  const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
  await expect(locator).not.toBeChecked()
}

async function assertEditableImpl(ctx: CommandContext): Promise<void> {
  const { page, command, variables } = ctx
  const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
  await expect(locator).toBeEditable()
}

async function assertNotEditableImpl(ctx: CommandContext): Promise<void> {
  const { page, command, variables } = ctx
  const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
  await expect(locator).not.toBeEditable()
}

async function assertElementPresentImpl(ctx: CommandContext): Promise<void> {
  const { page, command, variables } = ctx
  const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
  await expect(locator).toBeAttached()
}

async function assertElementNotPresentImpl(ctx: CommandContext): Promise<void> {
  const { page, command, variables } = ctx
  const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
  await expect(locator).not.toBeAttached()
}

async function assertSelectedValueImpl(ctx: CommandContext): Promise<void> {
  const { page, command, variables } = ctx
  const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
  const expected = variables.interpolate(command.value ?? '')
  await expect(locator).toHaveValue(expected)
}

async function assertNotSelectedValueImpl(ctx: CommandContext): Promise<void> {
  const { page, command, variables } = ctx
  const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
  const expected = variables.interpolate(command.value ?? '')
  await expect(locator).not.toHaveValue(expected)
}

async function assertSelectedLabelImpl(ctx: CommandContext): Promise<void> {
  const { page, command, variables } = ctx
  const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
  const expected = variables.interpolate(command.value ?? '')
  const selectedText = await locator.evaluate((el: HTMLSelectElement) =>
    el.options[el.selectedIndex]?.text ?? ''
  )
  if (selectedText !== expected) {
    throw new Error(`Expected selected label "${expected}" but got "${selectedText}"`)
  }
}

async function assertNotTextImpl(ctx: CommandContext): Promise<void> {
  const { page, command, variables } = ctx
  const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
  const expected = variables.interpolate(command.value ?? '')
  await expect(locator).not.toContainText(expected)
}

async function assertVariableImpl(ctx: CommandContext): Promise<void> {
  const { command, variables } = ctx
  const varName = command.target ?? ''
  const expected = variables.interpolate(command.value ?? '')
  const actual = String(variables.get(varName) ?? '')
  if (actual !== expected) {
    throw new Error(`Variable "${varName}": expected "${expected}" but got "${actual}"`)
  }
}

// --- Export all handlers (both assert* and verify* variants) ---

export const assertionHandlers: Record<string, AssertFn> = {
  assertText: makeAssertion(assertTextImpl, false),
  verifyText: makeAssertion(assertTextImpl, true),

  assertTitle: makeAssertion(assertTitleImpl, false),
  verifyTitle: makeAssertion(assertTitleImpl, true),

  assertValue: makeAssertion(assertValueImpl, false),
  verifyValue: makeAssertion(assertValueImpl, true),

  assertChecked: makeAssertion(assertCheckedImpl, false),
  verifyChecked: makeAssertion(assertCheckedImpl, true),

  assertNotChecked: makeAssertion(assertNotCheckedImpl, false),
  verifyNotChecked: makeAssertion(assertNotCheckedImpl, true),

  assertEditable: makeAssertion(assertEditableImpl, false),
  verifyEditable: makeAssertion(assertEditableImpl, true),

  assertNotEditable: makeAssertion(assertNotEditableImpl, false),
  verifyNotEditable: makeAssertion(assertNotEditableImpl, true),

  assertElementPresent: makeAssertion(assertElementPresentImpl, false),
  verifyElementPresent: makeAssertion(assertElementPresentImpl, true),

  assertElementNotPresent: makeAssertion(assertElementNotPresentImpl, false),
  verifyElementNotPresent: makeAssertion(assertElementNotPresentImpl, true),

  assertSelectedValue: makeAssertion(assertSelectedValueImpl, false),
  verifySelectedValue: makeAssertion(assertSelectedValueImpl, true),

  assertNotSelectedValue: makeAssertion(assertNotSelectedValueImpl, false),
  verifyNotSelectedValue: makeAssertion(assertNotSelectedValueImpl, true),

  assertSelectedLabel: makeAssertion(assertSelectedLabelImpl, false),
  verifySelectedLabel: makeAssertion(assertSelectedLabelImpl, true),

  assertNotText: makeAssertion(assertNotTextImpl, false),
  verifyNotText: makeAssertion(assertNotTextImpl, true),

  assert: makeAssertion(assertVariableImpl, false),
  verify: makeAssertion(assertVariableImpl, true),
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
