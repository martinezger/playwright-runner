import { CommandContext } from './types'
import { resolveLocatorWithFallback } from '../locator'

export const navigationHandlers = {
  async open(ctx: CommandContext): Promise<void> {
    const { page, command, variables, baseUrl } = ctx
    const target = variables.interpolate(command.target ?? '')
    const url = target.startsWith('http') ? target : `${baseUrl}${target}`
    await page.goto(url)
  },

  async close(ctx: CommandContext): Promise<void> {
    await ctx.page.close()
  },

  async setWindowSize(ctx: CommandContext): Promise<void> {
    const { page, command } = ctx
    const [w, h] = (command.target ?? '1280x800').split('x').map(Number)
    await page.setViewportSize({ width: w, height: h })
  },

  async selectFrame(ctx: CommandContext): Promise<void> {
    // Frame switching is handled by storing a frameLocator reference.
    // For "relative=top" we navigate back to main frame context.
    // Full frame support requires ctx to carry a frame reference;
    // for now we support relative=top (reset) and index=N.
    const { command } = ctx
    const target = command.target ?? ''
    if (target === 'relative=top' || target === 'relative=parent') {
      // No-op in Playwright's page context model — operations default to main frame
      return
    }
    // For index= or id= we log a warning; full frame support needs ctx refactor
    console.warn(`[selectFrame] Limited support: ${target}. Use page.frameLocator() manually for nested frames.`)
  },

  async selectWindow(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const handle = variables.interpolate(command.target ?? '')
    if (handle.startsWith('handle=')) {
      const name = handle.slice(7)
      const stored = variables.get(name)
      if (stored) {
        // Find the page matching the stored URL handle
        const context = page.context()
        const pages = context.pages()
        const target = pages.find(p => p.url() === stored || p === stored)
        if (target) await target.bringToFront()
      }
    }
  },
}
