import { expect } from '@playwright/test'
import { CommandContext } from './types'
import { resolveLocatorWithFallback } from '../locator'

function getTimeout(ctx: CommandContext): number {
  const ms = parseInt(ctx.command.value ?? '0')
  return ms > 0 ? ms : (ctx.project.timeout ?? 30000)
}

export const waitHandlers = {
  async waitForElementPresent(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
    await locator.waitFor({ state: 'attached', timeout: getTimeout(ctx) })
  },

  async waitForElementNotPresent(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
    await locator.waitFor({ state: 'detached', timeout: getTimeout(ctx) })
  },

  async waitForElementVisible(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
    await locator.waitFor({ state: 'visible', timeout: getTimeout(ctx) })
  },

  async waitForElementNotVisible(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
    await locator.waitFor({ state: 'hidden', timeout: getTimeout(ctx) })
  },

  async waitForElementEditable(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
    await expect(locator).toBeEditable({ timeout: getTimeout(ctx) })
  },

  async waitForElementNotEditable(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
    await expect(locator).not.toBeEditable({ timeout: getTimeout(ctx) })
  },
}
