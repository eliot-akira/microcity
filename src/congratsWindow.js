import { CONGRATS_WINDOW_CLOSED } from './messages'
import { ModalWindow } from './modalWindow'

var CongratsWindow = ModalWindow(function () {
  $(congratsFormID).on('submit', submit.bind(this))
})

var congratsFormID = '#congratsForm'
var congratsMessageID = '#congratsMessage'
var congratsOKID = '#congratsOK'

var submit = function (e) {
  e.preventDefault()
  this.close()
}

CongratsWindow.prototype.close = function () {
  this._toggleDisplay()
  this._emitEvent(CONGRATS_WINDOW_CLOSED)
}

CongratsWindow.prototype.open = function (message) {
  this._toggleDisplay()
  $(congratsMessageID).text(message)
  $(congratsOKID).focus()
}

export { CongratsWindow }
