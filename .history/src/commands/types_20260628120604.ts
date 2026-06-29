import { Page } from '@playwright/test'
import { CommandShape } from '../types'
import { Variables } from '../variables'
import { ProjectShape } from '../types'

export interface CommandContext {
  page: Page
  command: CommandShape
  variables: Variables
  baseUrl: string
  project: ProjectShape
  softFailures: string[]
  /** mutable delay in ms between commands (modified by setSpeed) */
  options: RunnerOptions
}

export interface RunnerOptions {
  delay: number
}

export type CommandHandler = (ctx: CommandContext) => Promise<void>
