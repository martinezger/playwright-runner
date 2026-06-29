import { CommandContext } from './types'
import { resolveLocatorWithFallback } from '../locator'

export const storeHandlers = {
  async store(ctx: CommandContext): Promise<void> {
    const { command, variables } = ctx
    const value = variables.interpolate(command.target ?? '')
    variables.set(command.value ?? '', value)
  },

  async storeText(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
    const text = await locator.innerText()
    variables.set(command.value ?? '', text)
  },

  async storeValue(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(page, variables.interpolate(command.target ?? ''), command.targets)
    const value = await locator.inputValue()
    variables.set(command.value ?? '', value)
  },

  async storeTitle(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const title = await page.title()
    variables.set(command.value ?? '', title)
  },

  async storeAttribute(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    // target format: "locator@attributeName"
    const raw = variables.interpolate(command.target ?? '')
    const atIndex = raw.lastIndexOf('@')
    if (atIndex === -1) throw new Error(`storeAttribute target must be "locator@attrName", got: ${raw}`)
    const locatorStr = raw.slice(0, atIndex)
    const attrName = raw.slice(atIndex + 1)
    const locator = await resolveLocatorWithFallback(page, locatorStr, undefined)
    const value = await locator.getAttribute(attrName)
    variables.set(command.value ?? '', value ?? '')
  },

  async storeXpathCount(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const xpath = variables.interpolate(command.target ?? '')
    const count = await page.locator(`xpath=${xpath}`).count()
    variables.set(command.value ?? '', count)
  },

  async storeWindowHandle(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    variables.set(command.value ?? '', page.url())
  },

  async storeJson(ctx: CommandContext): Promise<void> {
    const { command, variables } = ctx
    const json = variables.interpolate(command.target ?? '')
    try {
      variables.set(command.value ?? '', JSON.parse(json))
    } catch {
      throw new Error(`storeJson: invalid JSON: ${json}`)
    }
  },
}
