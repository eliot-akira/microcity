import { NAG_WINDOW_CLOSED } from '../messages'
import { ModalWindow } from './modalWindow'

const NagWindow = ModalWindow(function () {
  $(nagFormID).on('submit', submit.bind(this))
})

var nagFormID = '#nagForm'
const nagOKID = '#nagOK'

var submit = function (e) {
  e.preventDefault()
  this.close()
}

NagWindow.prototype.close = function () {
  this._toggleDisplay()
  this._emitEvent(NAG_WINDOW_CLOSED)
}

NagWindow.prototype.open = function () {
  this._toggleDisplay()
  $(nagOKID).focus()
}

export { NagWindow }
