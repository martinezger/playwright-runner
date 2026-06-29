import * as fs from 'fs'
import * as path from 'path'
import { ProjectShape } from './types'

export function loadSideFile(filePath: string): ProjectShape {
  const resolved = path.resolve(filePath)
  if (!fs.existsSync(resolved)) {
    throw new Error(`Side file not found: ${resolved}`)
  }

  let raw: unknown
  try {
    raw = JSON.parse(fs.readFileSync(resolved, 'utf-8'))
  } catch (e) {
    throw new Error(`Failed to parse side file: ${(e as Error).message}`)
  }

  const project = raw as ProjectShape
  if (!project.id || !project.tests || !project.suites) {
    throw new Error(`Invalid .side file: missing required fields (id, tests, suites)`)
  }

  return project
}
