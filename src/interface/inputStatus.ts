import { EventEmitter } from '../eventEmitter'
import { GameCanvas } from './gameCanvas'
import { GameTools } from '../tools/gameTools'
import * as Messages from '../messages'
import { MiscUtils } from '../utils'

const canvasID = '#' + GameCanvas.DEFAULT_ID
const toolOutputID = '#toolOutput'

const InputStatus = EventEmitter(function (map, tileWidth) {
  this.gameTools = GameTools(map)

  this.gameTools.addEventListener(
    Messages.QUERY_WINDOW_NEEDED,
    MiscUtils.reflectEvent.bind(this, Messages.QUERY_WINDOW_NEEDED)
  )

  this.canvasID = MiscUtils.normaliseDOMid(canvasID)

  this._tileWidth = tileWidth

  // Keyboard Movement
  this.up = false
  this.down = false
  this.left = false
  this.right = false
  this.escape = false

  // Mouse movement
  this.mouseX = -1
  this.mouseY = -1

  // Mouse drags
  this._dragging = false
  this._lastdragX = -1
  this._lastdragY = -1

  // Tool buttons
  this.toolName = null
  this.currentTool = null
  this.toolWidth = 0
  this.toolColour = ''

  this.$canvas = $(this.canvasID)

  // Add the listeners
  $(document).keydown(keyDownHandler.bind(this))
  $(document).keyup(keyUpHandler.bind(this))

  this.getRelativeCoordinates = getRelativeCoordinates.bind(this)
  this.$canvas.on('mouseenter', mouseEnterHandler.bind(this))
  this.$canvas.on('mouseleave', mouseLeaveHandler.bind(this))

  this.mouseDownHandler = mouseDownHandler.bind(this)
  this.mouseMoveHandler = mouseMoveHandler.bind(this)
  this.mouseUpHandler = mouseUpHandler.bind(this)
  this.canvasClickHandler = canvasClickHandler.bind(this)

  $('.toolButton').click(toolButtonHandler.bind(this))
  $('#budgetRequest').click(budgetHandler.bind(this))
  $('#evalRequest').click(evalHandler.bind(this))
  $('#disasterRequest').click(disasterHandler.bind(this))
  $('#pauseRequest').click(this.speedChangeHandler.bind(this))
  $('#screenshotRequest').click(screenshotHandler.bind(this))
  $('#settingsRequest').click(settingsHandler.bind(this))
  $('#saveRequest').click(saveHandler.bind(this))
  $('#debugRequest').click(debugHandler.bind(this))
})

function keyDownHandler(e) {
  let handled = false

  switch (e.keyCode) {
    case 38:
    case 87:
      this.up = true
      handled = true
      break

    case 40:
    case 83:
      this.down = true
      handled = true
      break

    case 39:
    case 68:
      this.right = true
      handled = true
      break

    case 37:
    case 65:
      this.left = true
      handled = true
      break

    case 27:
      this.escape = true
      handled = true
  }

  if (handled) e.preventDefault()
}

function keyUpHandler(e) {
  switch (e.keyCode) {
    case 38:
    case 87:
      this.up = false
      break

    case 40:
    case 83:
      this.down = false
      break

    case 39:
    case 68:
      this.right = false
      break

    case 37:
    case 65:
      this.left = false
      break

    case 27:
      this.escape = false
  }
}

function getRelativeCoordinates(e) {
  const cRect = document.querySelector(this.canvasID).getBoundingClientRect()
  return { x: e.clientX - cRect.left, y: e.clientY - cRect.top }
}

function mouseEnterHandler(e) {
  if (this.currentTool == null) return

  this.$canvas.on('mousemove', this.mouseMoveHandler)

  if (this.currentTool.isDraggable) { this.$canvas.on('mousedown', this.mouseDownHandler) } else this.$canvas.on('click', this.canvasClickHandler)
}

function mouseDownHandler(e) {
  if (e.which !== 1 || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return

  const coords = this.getRelativeCoordinates(e)
  this.mouseX = coords.x
  this.mouseY = coords.y

  this._dragging = true
  this._emitEvent(Messages.TOOL_CLICKED, { x: this.mouseX, y: this.mouseY })

  this._lastDragX = Math.floor(this.mouseX / this._tileWidth)
  this._lastDragY = Math.floor(this.mouseY / this._tileWidth)

  this.$canvas.on('mouseup', this.mouseUpHandler)
  e.preventDefault()
}

function mouseUpHandler(e) {
  this._dragging = false
  this._lastDragX = -1
  this._lastDragY = -1
  this.$canvas.off('mouseup')
  e.preventDefault()
}

function mouseLeaveHandler(e) {
  this.$canvas.off('mousedown')
  this.$canvas.off('mousemove')
  this.$canvas.off('mouseup')

  // Watch out: we might have been mid-drag
  if (this._dragging) {
    this._dragging = false
    this._lastDragX = -1
    this._lastDragY = -1
  }

  this.$canvas.off('click')

  this.mouseX = -1
  this.mouseY = -1
}

function mouseMoveHandler(e) {
  const coords = this.getRelativeCoordinates(e)
  this.mouseX = coords.x
  this.mouseY = coords.y

  if (this._dragging) {
    // XXX Work up how to patch up the path for fast mouse moves. My first attempt was too slow, and ended up missing
    // mouseUp events
    const x = Math.floor(this.mouseX / this._tileWidth)
    const y = Math.floor(this.mouseY / this._tileWidth)

    const lastX = this._lastDragX
    const lastY = this._lastDragY
    if (x !== lastX || y !== lastY) {
      this._emitEvent(Messages.TOOL_CLICKED, { x: this.mouseX, y: this.mouseY })
      this._lastDragX = x
      this._lastDragY = y
    }
  }
}

function canvasClickHandler(e) {
  if (
    e.which !== 1
    || e.shiftKey
    || e.altKey
    || e.ctrlKey
    || e.metaKey
    || this.mouseX === -1
    || this._mouseY === -1
    || this._dragging
  ) { return }

  this._emitEvent(Messages.TOOL_CLICKED, { x: this.mouseX, y: this.mouseY })
  e.preventDefault()
}

function toolButtonHandler(e) {

  // Remove highlight from last tool button
  $('.selected').each(function () {
    this.classList.remove('selected')
    this.classList.add('unselected')
    // $(this).removeClass('selected')
    // $(this).addClass('unselected')
  })

  let el = e.target
  let $el = $(el)

  if (el.tagName.toLowerCase()==='img') {
    el = el.parentNode // button
    $el = $(el)
  }

  // Add highlight
  $el.removeClass('unselected')
  $el.addClass('selected')

  this.toolName = $el.attr('data-tool')
  this.toolWidth = $el.attr('data-size')
  this.currentTool = this.gameTools[this.toolName]

  this.toolColour = '' // $el.attr('data-colour')

  // $(toolOutputID).html('Tools')

  if (this.toolName !== 'query') {
    this.$canvas.removeClass('helpPointer')
    this.$canvas.addClass('pointer')
  } else {
    this.$canvas.removeClass('pointer')
    this.$canvas.addClass('helpPointer')
  }

  e.preventDefault()
}

InputStatus.prototype.speedChangeHandler = function (e) {
  const requestedSpeed = $('#pauseRequest').text()
  const newRequest = requestedSpeed === 'Pause' ? 'Play' : 'Pause'
  $('#pauseRequest').text(newRequest)
  this._emitEvent(Messages.SPEED_CHANGE, requestedSpeed)
}

InputStatus.prototype.clearTool = function () {
  if (this.toolName === 'query') {
    this.$canvas.removeClass('helpPointer')
    this.$canvas.addClass('pointer')
  }

  this.currentTool = null
  this.toolWidth = 0
  this.toolColour = ''
  $('.selected').removeClass('selected')
}

const makeHandler = function (message) {
  const m = Messages[message]

  return function (e) {
    this._emitEvent(m)
  }
}

var budgetHandler = makeHandler('BUDGET_REQUESTED')
var debugHandler = makeHandler('DEBUG_WINDOW_REQUESTED')
var disasterHandler = makeHandler('DISASTER_REQUESTED')
var evalHandler = makeHandler('EVAL_REQUESTED')
var screenshotHandler = makeHandler('SCREENSHOT_WINDOW_REQUESTED')
var settingsHandler = makeHandler('SETTINGS_WINDOW_REQUESTED')
var saveHandler = makeHandler('SAVE_REQUESTED')

export { InputStatus }
