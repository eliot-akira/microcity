import { TOUCH_WINDOW_CLOSED } from '../messages'
import { ModalWindow } from './modalWindow'

const touchFormID = '#touchForm'
const touchOKID = '#touchOK'

const submit = function (e) {
  e.preventDefault()
  this.close()
}

const TouchWarnWindow = ModalWindow(function () {
  $(touchFormID).on('submit', submit.bind(this))
})

TouchWarnWindow.prototype.close = function () {
  this._toggleDisplay()
  this._emitEvent(TOUCH_WINDOW_CLOSED)
}

TouchWarnWindow.prototype.open = function () {
  this._toggleDisplay()
  $(touchOKID).focus()
}

export { TouchWarnWindow }
