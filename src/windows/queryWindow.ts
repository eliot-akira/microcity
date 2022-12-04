import { Config } from '../config'
import { QUERY_WINDOW_CLOSED } from '../messages'
import { ModalWindow } from './modalWindow'
import { MiscUtils } from '../utils'

const queryFormID = '#queryForm'
const queryOKID = '#queryOK'

const submit = function (e) {
  e.preventDefault()
  this.close()
}

const QueryWindow = ModalWindow(function () {
  this._debugToggled = false
  $(queryFormID).on('submit', submit.bind(this))
  this.$queryOK = $(queryOKID)
})

QueryWindow.prototype.close = function () {
  this._toggleDisplay()
  this._emitEvent(QUERY_WINDOW_CLOSED)
}

QueryWindow.prototype.open = function () {
  if ((Config.debug || Config.queryDebug) && !this._debugToggled) {
    this._debugToggled = true
    $('.queryDebug').removeClass('hidden')
  }

  this._toggleDisplay()
  this.$queryOK.focus()
}

export { QueryWindow }
