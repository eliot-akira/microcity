import { DEBUG_WINDOW_CLOSED } from '../messages'
import { ModalWindow } from './modalWindow'
import { MiscUtils } from '../utils'

const DebugWindow = ModalWindow(function () {
  $(debugCancelID).on('click', cancel.bind(this))
  $(debugFormID).on('submit', submit.bind(this))
})

var debugCancelID = '#debugCancel'
var debugFormID = '#debugForm'
const debugOKID = '#debugOK'

DebugWindow.prototype.close = function (actions) {
  actions = actions || []
  this._emitEvent(DEBUG_WINDOW_CLOSED, actions)
  this._toggleDisplay()
}

var cancel = function (e) {
  e.preventDefault()
  this.close([])
}

var submit = function (e) {
  e.preventDefault()

  const actions = []

  // Get element values
  const shouldAdd = $('.debugAdd:checked').val()
  if (shouldAdd === 'true') { actions.push({ action: DebugWindow.ADD_FUNDS, data: {} }) }

  this.close(actions)
}

DebugWindow.prototype.open = function () {
  this._toggleDisplay()
}

const defineAction = (function () {
  let uid = 0

  return function (name) {
    Object.defineProperty(
      DebugWindow,
      name,
      MiscUtils.makeConstantDescriptor(uid)
    )
    uid += 1
  }
})()

defineAction('ADD_FUNDS')

export { DebugWindow }
