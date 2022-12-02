import { SCREENSHOT_LINK_CLOSED } from '../messages'
import { ModalWindow } from './modalWindow'
import { MiscUtils } from './utils'

const screenshotLinkFormID = '#screenshotLinkForm'
const screenshotLinkOKID = '#screenshotLinkOK'
const screenshotLinkID = '#screenshotLink'

const cancel = function (e) {
  e.preventDefault()
  this.close()
}

const submit = function (e) {
  e.preventDefault()
  this.close()
}

const ScreenshotLinkWindow = ModalWindow(function () {
  $(screenshotLinkFormID).on('submit', submit.bind(this))
})

ScreenshotLinkWindow.prototype.close = function () {
  this._toggleDisplay()
  this._emitEvent(SCREENSHOT_LINK_CLOSED)
}

ScreenshotLinkWindow.prototype.open = function (screenshotLink) {
  $(screenshotLinkID).attr('href', screenshotLink)
  this._toggleDisplay()
}

export { ScreenshotLinkWindow }
