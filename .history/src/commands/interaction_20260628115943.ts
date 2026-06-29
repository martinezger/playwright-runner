import { CommandContext } from './types'
import { resolveLocatorWithFallback } from '../locator'

export const interactionHandlers = {
  async click(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    await locator.click()
  },

  async clickAt(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    const coords = command.value ?? '0,0'
    const [x, y] = coords.split(',').map(Number)
    await locator.click({ position: { x, y } })
  },

  async doubleClick(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    await locator.dblclick()
  },

  async doubleClickAt(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    const coords = command.value ?? '0,0'
    const [x, y] = coords.split(',').map(Number)
    await locator.dblclick({ position: { x, y } })
  },

  async type(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    await locator.fill(variables.interpolate(command.value ?? ''))
  },

  async sendKeys(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    const value = variables.interpolate(command.value ?? '')
    // Replace Selenium key constants like ${KEY_ENTER} with Playwright key names
    const resolved = replaceKeyConstants(value)
    if (resolved.startsWith('KEY_')) {
      await locator.press(resolved.replace('KEY_', ''))
    } else {
      await locator.pressSequentially(resolved)
    }
  },

  async check(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    await locator.check()
  },

  async uncheck(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    await locator.uncheck()
  },

  async select(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    const option = variables.interpolate(command.value ?? '')
    await locator.selectOption(parseSelectOption(option))
  },

  async addSelection(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    const option = variables.interpolate(command.value ?? '')
    // Get current selections and add new one
    const current = await locator.evaluate((el: HTMLSelectElement) =>
      Array.from(el.selectedOptions).map(o => o.value)
    )
    await locator.selectOption([...current, parseSelectOption(option)])
  },

  async removeSelection(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    const option = variables.interpolate(command.value ?? '')
    const toRemove = resolveOptionValue(option)
    const remaining = await locator.evaluate((el: HTMLSelectElement, remove: string) =>
      Array.from(el.selectedOptions)
        .map(o => o.value)
        .filter(v => v !== remove),
      toRemove
    )
    await locator.selectOption(remaining)
  },

  async dragAndDropToObject(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const source = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    const target = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.value ?? ''),
      undefined
    )
    await source.dragTo(target)
  },

  async editContent(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    await locator.fill(variables.interpolate(command.value ?? ''))
  },

  async submit(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    await locator.evaluate((el: HTMLFormElement) => el.submit())
  },

  async mouseOver(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    await locator.hover()
  },

  async mouseDown(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    await locator.dispatchEvent('mousedown')
  },

  async mouseDownAt(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    const coords = command.value ?? '0,0'
    const [x, y] = coords.split(',').map(Number)
    await locator.dispatchEvent('mousedown', { clientX: x, clientY: y })
  },

  async mouseUp(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    await locator.dispatchEvent('mouseup')
  },

  async mouseUpAt(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    const coords = command.value ?? '0,0'
    const [x, y] = coords.split(',').map(Number)
    await locator.dispatchEvent('mouseup', { clientX: x, clientY: y })
  },

  async mouseMoveAt(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    await locator.hover()
  },

  async mouseOut(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const locator = await resolveLocatorWithFallback(
      page,
      variables.interpolate(command.target ?? ''),
      command.targets
    )
    await locator.dispatchEvent('mouseout')
  },
}

// Selenium option locator: label=John, value=john, index=0, id=opt1
function parseSelectOption(option: string): { label?: string; value?: string; index?: number } {
  if (option.startsWith('label=')) return { label: option.slice(6) }
  if (option.startsWith('value=')) return { value: option.slice(6) }
  if (option.startsWith('index=')) return { index: parseInt(option.slice(6)) }
  if (option.startsWith('id=')) return { value: option.slice(3) }
  return { label: option }
}

function resolveOptionValue(option: string): string {
  if (option.startsWith('value=')) return option.slice(6)
  if (option.startsWith('label=')) return option.slice(6)
  return option
}

const KEY_MAP: Record<string, string> = {
  '${KEY_ENTER}': 'Enter',
  '${KEY_TAB}': 'Tab',
  '${KEY_ESCAPE}': 'Escape',
  '${KEY_BACKSPACE}': 'Backspace',
  '${KEY_DELETE}': 'Delete',
  '${KEY_UP}': 'ArrowUp',
  '${KEY_DOWN}': 'ArrowDown',
  '${KEY_LEFT}': 'ArrowLeft',
  '${KEY_RIGHT}': 'ArrowRight',
  '${KEY_HOME}': 'Home',
  '${KEY_END}': 'End',
  '${KEY_PAGE_UP}': 'PageUp',
  '${KEY_PAGE_DOWN}': 'PageDown',
  '${KEY_SHIFT}': 'Shift',
  '${KEY_CONTROL}': 'Control',
  '${KEY_ALT}': 'Alt',
  '${KEY_F1}': 'F1',
  '${KEY_F2}': 'F2',
  '${KEY_F3}': 'F3',
  '${KEY_F4}': 'F4',
  '${KEY_F5}': 'F5',
  '${KEY_F6}': 'F6',
  '${KEY_F7}': 'F7',
  '${KEY_F8}': 'F8',
  '${KEY_F9}': 'F9',
  '${KEY_F10}': 'F10',
  '${KEY_F11}': 'F11',
  '${KEY_F12}': 'F12',
}

function replaceKeyConstants(value: string): string {
  let result = value
  for (const [seleniumKey, pwKey] of Object.entries(KEY_MAP)) {
    result = result.replace(seleniumKey, pwKey)
  }
  return result
}
