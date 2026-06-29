import { CommandHandler } from './types'
import { navigationHandlers } from './navigation'
import { interactionHandlers } from './interaction'
import { assertionHandlers } from './assertions'
import { waitHandlers } from './waits'
import { storeHandlers } from './store'
import { scriptHandlers } from './script'
import { alertHandlers } from './alerts'

/**
 * Maps every Selenium IDE command name to its Playwright handler.
 * Command names are camelCase to match .side file format.
 */
export const commandDispatcher: Record<string, CommandHandler> = {
  // Navigation
  open: navigationHandlers.open,
  close: navigationHandlers.close,
  setWindowSize: navigationHandlers.setWindowSize,
  selectFrame: navigationHandlers.selectFrame,
  selectWindow: navigationHandlers.selectWindow,

  // Interaction
  click: interactionHandlers.click,
  clickAt: interactionHandlers.clickAt,
  doubleClick: interactionHandlers.doubleClick,
  doubleClickAt: interactionHandlers.doubleClickAt,
  type: interactionHandlers.type,
  sendKeys: interactionHandlers.sendKeys,
  check: interactionHandlers.check,
  uncheck: interactionHandlers.uncheck,
  select: interactionHandlers.select,
  addSelection: interactionHandlers.addSelection,
  removeSelection: interactionHandlers.removeSelection,
  dragAndDropToObject: interactionHandlers.dragAndDropToObject,
  editContent: interactionHandlers.editContent,
  submit: interactionHandlers.submit,
  mouseOver: interactionHandlers.mouseOver,
  mouseDown: interactionHandlers.mouseDown,
  mouseDownAt: interactionHandlers.mouseDownAt,
  mouseUp: interactionHandlers.mouseUp,
  mouseUpAt: interactionHandlers.mouseUpAt,
  mouseMoveAt: interactionHandlers.mouseMoveAt,
  mouseOut: interactionHandlers.mouseOut,

  // Assertions (hard)
  assertText: assertionHandlers.assertText,
  assertTitle: assertionHandlers.assertTitle,
  assertValue: assertionHandlers.assertValue,
  assertChecked: assertionHandlers.assertChecked,
  assertNotChecked: assertionHandlers.assertNotChecked,
  assertEditable: assertionHandlers.assertEditable,
  assertNotEditable: assertionHandlers.assertNotEditable,
  assertElementPresent: assertionHandlers.assertElementPresent,
  assertElementNotPresent: assertionHandlers.assertElementNotPresent,
  assertSelectedValue: assertionHandlers.assertSelectedValue,
  assertNotSelectedValue: assertionHandlers.assertNotSelectedValue,
  assertSelectedLabel: assertionHandlers.assertSelectedLabel,
  assertNotText: assertionHandlers.assertNotText,
  assert: assertionHandlers.assert,
  assertAlert: alertHandlers.assertAlert,
  assertConfirmation: alertHandlers.assertConfirmation,
  assertPrompt: alertHandlers.assertPrompt,

  // Verifications (soft)
  verifyText: assertionHandlers.verifyText,
  verifyTitle: assertionHandlers.verifyTitle,
  verifyValue: assertionHandlers.verifyValue,
  verifyChecked: assertionHandlers.verifyChecked,
  verifyNotChecked: assertionHandlers.verifyNotChecked,
  verifyEditable: assertionHandlers.verifyEditable,
  verifyNotEditable: assertionHandlers.verifyNotEditable,
  verifyElementPresent: assertionHandlers.verifyElementPresent,
  verifyElementNotPresent: assertionHandlers.verifyElementNotPresent,
  verifySelectedValue: assertionHandlers.verifySelectedValue,
  verifyNotSelectedValue: assertionHandlers.verifyNotSelectedValue,
  verifySelectedLabel: assertionHandlers.verifySelectedLabel,
  verifyNotText: assertionHandlers.verifyNotText,
  verify: assertionHandlers.verify,

  // Waits
  waitForElementPresent: waitHandlers.waitForElementPresent,
  waitForElementNotPresent: waitHandlers.waitForElementNotPresent,
  waitForElementVisible: waitHandlers.waitForElementVisible,
  waitForElementNotVisible: waitHandlers.waitForElementNotVisible,
  waitForElementEditable: waitHandlers.waitForElementEditable,
  waitForElementNotEditable: waitHandlers.waitForElementNotEditable,

  // Store
  store: storeHandlers.store,
  storeText: storeHandlers.storeText,
  storeValue: storeHandlers.storeValue,
  storeTitle: storeHandlers.storeTitle,
  storeAttribute: storeHandlers.storeAttribute,
  storeXpathCount: storeHandlers.storeXpathCount,
  storeWindowHandle: storeHandlers.storeWindowHandle,
  storeJson: storeHandlers.storeJson,

  // Script / utilities
  executeScript: scriptHandlers.executeScript,
  executeAsyncScript: scriptHandlers.executeAsyncScript,
  runScript: scriptHandlers.runScript,
  echo: scriptHandlers.echo,
  pause: scriptHandlers.pause,
  setSpeed: scriptHandlers.setSpeed,
  debugger: scriptHandlers.debugger,

  // Alerts / dialogs
  answerOnNextPrompt: alertHandlers.answerOnNextPrompt,
  chooseOkOnNextConfirmation: alertHandlers.chooseOkOnNextConfirmation,
  chooseCancelOnNextConfirmation: alertHandlers.chooseCancelOnNextConfirmation,
  chooseCancelOnNextPrompt: alertHandlers.chooseCancelOnNextPrompt,
  webdriverAnswerOnVisiblePrompt: alertHandlers.webdriverAnswerOnVisiblePrompt,
  webdriverChooseOkOnVisibleConfirmation: alertHandlers.webdriverChooseOkOnVisibleConfirmation,
  webdriverChooseCancelOnVisibleConfirmation: alertHandlers.webdriverChooseCancelOnVisibleConfirmation,
  webdriverChooseCancelOnVisiblePrompt: alertHandlers.webdriverChooseCancelOnVisiblePrompt,
}

export { CommandHandler, CommandContext, RunnerOptions } from './types'
