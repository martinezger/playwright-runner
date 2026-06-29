/**
 * Mirrors the .side file format from @seleniumhq/side-model
 */

export interface CommandShape {
  id: string
  comment?: string
  command: string
  target?: string
  targets?: [string, string][]
  fallbackTargets?: [string, string][]
  value?: string
  values?: [string, string][]
  isBreakpoint?: boolean
  skip?: boolean
  opensWindow?: boolean
  windowHandleName?: string
  windowTimeout?: number
}

export interface TestShape {
  id: string
  name: string
  commands: CommandShape[]
}

export interface SuiteShape {
  id: string
  name: string
  persistSession: boolean
  parallel: boolean
  timeout: number
  tests: string[]
}

export interface ProjectShape {
  id: string
  version: '1.0' | '1.1' | '2.0' | '3.0'
  name: string
  url: string
  urls: string[]
  timeout?: number
  delay?: number
  plugins: string[]
  tests: TestShape[]
  suites: SuiteShape[]
}
