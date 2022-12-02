import { CONGRATS_WINDOW_CLOSED } from '../messages'
import { ModalWindow } from './modalWindow'

const CongratsWindow = ModalWindow(function () {
  $(congratsFormID).on('submit', submit.bind(this))
})

const congratsFormID = '#congratsForm'
const congratsMessageID = '#congratsMessage'
const congratsOKID = '#congratsOK'

const submit = function (e) {
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
