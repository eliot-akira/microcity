import { SCREENSHOT_WINDOW_CLOSED } from '../messages'
import { ModalWindow } from '../windows/modalWindow'
import { MiscUtils } from '../utils'

const ScreenshotWindow = ModalWindow(function () {
  $(screenshotCancelID).on('click', cancel.bind(this))
  $(screenshotFormID).on('submit', submit.bind(this))
})

var screenshotCancelID = '#screenshotCancel'
var screenshotFormID = '#screenshotForm'
const screenshotOKID = '#screenshotOK'

ScreenshotWindow.prototype.close = function (action) {
  action = action || null

  this._toggleDisplay()
  this._emitEvent(SCREENSHOT_WINDOW_CLOSED, action)
}

var cancel = function (e) {
  e.preventDefault()
  this.close(null)
}

var submit = function (e) {
  e.preventDefault()

  let action = null

  // Get choice
  const screenshotType = $('.screenshotType:checked').val()
  if (screenshotType === 'visible') action = ScreenshotWindow.SCREENSHOT_VISIBLE
  else action = ScreenshotWindow.SCREENSHOT_ALL

  this.close(action)
}

ScreenshotWindow.prototype.open = function (screenshotData) {
  this._toggleDisplay()
}

const defineAction = (function () {
  let uid = 1

  return function (name) {
    Object.defineProperty(
      ScreenshotWindow,
      name,
      MiscUtils.makeConstantDescriptor(uid)
    )
    uid += 1
  }
})()

defineAction('SCREENSHOT_VISIBLE')
defineAction('SCREENSHOT_ALL')

export { ScreenshotWindow }
