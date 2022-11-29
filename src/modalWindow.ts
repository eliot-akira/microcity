import { EventEmitter } from './eventEmitter'
import { MiscUtils } from './miscUtils'

var ModalWindow = function (constructorFunction, focusID) {
  focusID = focusID ? MiscUtils.normaliseDOMid(focusID) : null

  var newConstructor = function (opacityLayerID, windowID) {
    this._opacityLayer = MiscUtils.normaliseDOMid(opacityLayerID)
    this._windowID = MiscUtils.normaliseDOMid(windowID)
    constructorFunction.call(this)
  }

  newConstructor.prototype._toggleDisplay = function () {
    var opacityLayer = $(this._opacityLayer)
    opacityLayer = opacityLayer.length === 0 ? null : opacityLayer
    if (opacityLayer === null)
      throw new Error('Node ' + this._opacityLayer + ' not found')

    var modalWindow = $(this._windowID)
    modalWindow = modalWindow.length === 0 ? null : modalWindow
    if (modalWindow === null)
      throw new Error('Node ' + this._windowID + ' not found')

    opacityLayer.toggle()
    modalWindow.toggle()

    if (focusID !== null) $(focusID).focus()
    else $(this._windowID + ' input[type=submit]').focus()
  }

  return EventEmitter(newConstructor)
}

export { ModalWindow }
