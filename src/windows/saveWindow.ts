import { SAVE_WINDOW_CLOSED } from '../messages'
import { ModalWindow } from './modalWindow'

const saveFormID = '#saveForm'
const saveOKID = '#saveOK'

const submit = function (e) {
  e.preventDefault()
  this.close()
}

const SaveWindow = ModalWindow(function () {
  $(saveFormID).on('submit', submit.bind(this))
})

SaveWindow.prototype.close = function () {
  this._toggleDisplay()
  this._emitEvent(SAVE_WINDOW_CLOSED)
}

SaveWindow.prototype.open = function () {
  this._toggleDisplay()
  $(saveOKID).focus()
}

export { SaveWindow }
