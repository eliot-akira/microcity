import { SAVE_WINDOW_CLOSED } from './messages'
import { ModalWindow } from './modalWindow'

var SaveWindow = ModalWindow(function () {
  $(saveFormID).on('submit', submit.bind(this))
})

var saveFormID = '#saveForm'
var saveOKID = '#saveOK'

var submit = function (e) {
  e.preventDefault()
  this.close()
}

SaveWindow.prototype.close = function () {
  this._toggleDisplay()
  this._emitEvent(SAVE_WINDOW_CLOSED)
}

SaveWindow.prototype.open = function () {
  this._toggleDisplay()
  $(saveOKID).focus()
}

export { SaveWindow }
