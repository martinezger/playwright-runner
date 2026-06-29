import { CommandContext } from './types'

export const scriptHandlers = {
  async executeScript(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const script = variables.interpolate(command.target ?? '')
    const varName = command.value
    // Wrap in a function body — mirrors Selenium IDE behaviour
    // eslint-disable-next-line no-new-func
    const result = await page.evaluate(new Function(script) as () => unknown)
    if (varName) {
      variables.set(varName, result)
    }
  },

  async executeAsyncScript(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const script = variables.interpolate(command.target ?? '')
    const varName = command.value
    const result = await page.evaluate(
      new Function(script) as () => Promise<unknown>
    )
    if (varName) {
      variables.set(varName, result)
    }
  },

  async runScript(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const script = variables.interpolate(command.target ?? '')
    await page.addScriptTag({ content: script })
  },

  async echo(ctx: CommandContext): Promise<void> {
    const { command, variables } = ctx
    console.log('[echo]', variables.interpolate(command.target ?? ''))
  },

  async pause(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const ms = parseInt(variables.interpolate(command.target ?? '0'))
    await page.waitForTimeout(ms)
  },

  async setSpeed(ctx: CommandContext): Promise<void> {
    const { command, variables, options } = ctx
    const ms = parseInt(variables.interpolate(command.target ?? '0'))
    options.delay = ms
  },

  async debugger(_ctx: CommandContext): Promise<void> {
    // No-op in headless execution
  },
}
