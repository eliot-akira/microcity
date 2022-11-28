import { TOUCH_WINDOW_CLOSED } from './messages'
import { ModalWindow } from './modalWindow'

var TouchWarnWindow = ModalWindow(function () {
  $(touchFormID).on('submit', submit.bind(this))
})

var touchFormID = '#touchForm'
var touchOKID = '#touchOK'

var submit = function (e) {
  e.preventDefault()
  this.close()
}

TouchWarnWindow.prototype.close = function () {
  this._toggleDisplay()
  this._emitEvent(TOUCH_WINDOW_CLOSED)
}

TouchWarnWindow.prototype.open = function () {
  this._toggleDisplay()
  $(touchOKID).focus()
}

export { TouchWarnWindow }
