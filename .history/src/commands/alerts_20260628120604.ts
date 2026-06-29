import { Page } from '@playwright/test'
import { CommandContext } from './types'

/**
 * Manages pending dialog responses for the "on next" style commands.
 * A dialog handler is registered once and consumed on the next dialog event.
 */
export class DialogManager {
  private pendingAction: 'accept' | 'dismiss' | null = null
  private pendingPromptText: string | null = null
  private active = false

  attach(page: Page): void {
    if (this.active) return
    this.active = true
    page.on('dialog', async (dialog) => {
      if (this.pendingAction === 'accept') {
        if (this.pendingPromptText !== null) {
          await dialog.accept(this.pendingPromptText)
          this.pendingPromptText = null
        } else {
          await dialog.accept()
        }
      } else if (this.pendingAction === 'dismiss') {
        await dialog.dismiss()
      } else {
        // Default: accept to avoid blocking the test
        await dialog.accept()
      }
      this.pendingAction = null
    })
  }

  setPendingAccept(text?: string): void {
    this.pendingAction = 'accept'
    this.pendingPromptText = text ?? null
  }

  setPendingDismiss(): void {
    this.pendingAction = 'dismiss'
  }
}

// Per-test dialog managers keyed by page
const managerMap = new WeakMap<Page, DialogManager>()

export function getDialogManager(page: Page): DialogManager {
  if (!managerMap.has(page)) {
    const mgr = new DialogManager()
    mgr.attach(page)
    managerMap.set(page, mgr)
  }
  return managerMap.get(page)!
}

export const alertHandlers = {
  async answerOnNextPrompt(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const answer = variables.interpolate(command.target ?? '')
    getDialogManager(page).setPendingAccept(answer)
  },

  async chooseOkOnNextConfirmation(ctx: CommandContext): Promise<void> {
    getDialogManager(ctx.page).setPendingAccept()
  },

  async chooseCancelOnNextConfirmation(ctx: CommandContext): Promise<void> {
    getDialogManager(ctx.page).setPendingDismiss()
  },

  async chooseCancelOnNextPrompt(ctx: CommandContext): Promise<void> {
    getDialogManager(ctx.page).setPendingDismiss()
  },

  async webdriverAnswerOnVisiblePrompt(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const answer = variables.interpolate(command.target ?? '')
    const dialog = await page.waitForEvent('dialog')
    await dialog.accept(answer)
  },

  async webdriverChooseOkOnVisibleConfirmation(ctx: CommandContext): Promise<void> {
    const dialog = await ctx.page.waitForEvent('dialog')
    await dialog.accept()
  },

  async webdriverChooseCancelOnVisibleConfirmation(ctx: CommandContext): Promise<void> {
    const dialog = await ctx.page.waitForEvent('dialog')
    await dialog.dismiss()
  },

  async webdriverChooseCancelOnVisiblePrompt(ctx: CommandContext): Promise<void> {
    const dialog = await ctx.page.waitForEvent('dialog')
    await dialog.dismiss()
  },

  async assertAlert(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const expected = variables.interpolate(command.target ?? '')
    const dialog = await page.waitForEvent('dialog')
    if (dialog.message() !== expected) {
      await dialog.dismiss()
      throw new Error(`assertAlert: expected "${expected}", got "${dialog.message()}"`)
    }
    await dialog.accept()
  },

  async assertConfirmation(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const expected = variables.interpolate(command.target ?? '')
    const dialog = await page.waitForEvent('dialog')
    if (expected && dialog.message() !== expected) {
      await dialog.dismiss()
      throw new Error(`assertConfirmation: expected "${expected}", got "${dialog.message()}"`)
    }
    await dialog.accept()
  },

  async assertPrompt(ctx: CommandContext): Promise<void> {
    const { page, command, variables } = ctx
    const expected = variables.interpolate(command.target ?? '')
    const dialog = await page.waitForEvent('dialog')
    if (expected && dialog.message() !== expected) {
      await dialog.dismiss()
      throw new Error(`assertPrompt: expected "${expected}", got "${dialog.message()}"`)
    }
    await dialog.accept()
  },
}
