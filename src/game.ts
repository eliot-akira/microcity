import { BaseTool } from './tools/baseTool'
import { BudgetWindow } from './windows/budgetWindow'
import { Config } from './config'
import { CongratsWindow } from './windows/congratsWindow'
import { DebugWindow } from './windows/debugWindow'
import { DisasterWindow } from './windows/disasterWindow'
import { EvaluationWindow } from './windows/evaluationWindow'
import { GameCanvas } from './gameCanvas'
import { GameMap } from './map/gameMap'
import { InfoBar } from './infoBar'
import { InputStatus } from './inputStatus'
import * as Messages from './messages'
import { MonsterTV } from './monsterTV'
// import { NagWindow } from './nagWindow'
import { Notification } from './notification'
import { QueryWindow } from './windows/queryWindow'
import { Random } from './random'
import { RCI } from './rci'
import { SaveWindow } from './windows/saveWindow'
import { ScreenshotLinkWindow } from './windows/screenshotLinkWindow'
import { ScreenshotWindow } from './windows/screenshotWindow'
import { SettingsWindow } from './windows/settingsWindow'
import { Simulation } from './simulation'
import { Storage } from './storage'
import { Text } from './messages/text'
import { TouchWarnWindow } from './windows/touchWarnWindow'
import { TileSet } from './tiles/tileSet'

let ticks = 0

function tick() {

  ticks++

  this.handleInput()

  if (this.dialogOpen) {
    window.setTimeout(this.tick, 0)
    return
  }

  if (!this.simulation.isPaused()) {
    // Run the sim
    this.simulation.simTick()
  }

  // Run this even when paused: you can still build when paused
  this.mouse = this.calculateMouseForPaint()

  window.setTimeout(this.tick, this.tickDuration)
}

function commonAnimate() {
  if (this.dialogShowing) {
    nextFrame(this.animate)
    return
  }

  // Every two ticks, animate spites like train, airplane, boat
  if (!this.isPaused && ticks % 2 === 1) {
    this.simulation.spriteManager.moveObjects(
      this.simulation._constructSimData()
    )
  }

  const sprites = this.calculateSpritesForPaint(this.gameCanvas)
  this.gameCanvas.paint(this.mouse, sprites, this.isPaused)

  // sprites = this.calculateSpritesForPaint(this.monsterTV.canvas)
  // this.monsterTV.paint(sprites, this.isPaused)

  nextFrame(this.animate)
}

const debugAnimate = function () {
  const date = new Date()
  const elapsed = Math.floor((date - this.animStart) / 1000)

  if (elapsed > this.lastElapsed && this.frameCount > 0) {
    $('#fpsValue').text(Math.floor(this.frameCount / elapsed))
    this.lastElapsed = elapsed
  }

  this.frameCount++
  this.commonAnimate()
}

const disasterTimeout = 20 * 1000

const tileNames = [
  // 'asia',
  'classic',
  'earth',
  'future',
  // 'medieval',
  'moon',
  // 'snow',
  // 'wild-west'
]

const tileSetCache = {}

let tileSetImage


// Will be bound on construction
const touchListener = function (e) {
  window.removeEventListener('touchstart', this.touchListener, false)
  this._openWindow = 'touchWindow'
  this.dialogOpen = true
  this.touchWindow.open()
}

const nextFrame =
  window.requestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.webkitRequestAnimationFrame


function makeWindowOpenHandler(winName, customFn) {
  customFn = customFn || null

  return function () {
    if (this.dialogOpen) {
      console.warn(
        'Request made to open ' + winName + ' window. There is a dialog open!'
      )
      return
    }

    this.dialogOpen = true
    this._openWindow = winName + 'Window'
    const win = winName + 'Window'
    let data = []

    if (customFn) data = customFn()

    this[win].open.apply(this[win], data)
  }
}

class Game {

  constructor({
    map: gameMap,
    tileSet,
    snowTileSet,
    spriteSheet,
    difficulty = 0,
    name = 'Microcity'
  }) {

    let savedGame

    if (!gameMap.isSavedGame) {
      this.gameMap = gameMap
      savedGame = null
    } else {
    // Saved game
      this.gameMap = new GameMap(gameMap.width || 120, gameMap.height || 100) // 240, 240
      savedGame = gameMap
    }

    this.tileSet = tileSet
    this.snowTileSet = snowTileSet
    this.defaultSpeed = Simulation.SPEED_MED
    this.simulation = new Simulation(
      this.gameMap,
      difficulty,
      this.defaultSpeed,
      savedGame
    )

    // Tick duration in milliseconds - originally 0 - see function tick() above
    this.tickDuration = 30

    this.name = name || 'Microcity'
    this.everClicked = false

    if (savedGame) this.load(savedGame)

    this.rci = new RCI('RCIContainer', this.simulation)

    // Note: must init canvas before inputStatus
    this.gameCanvas = new GameCanvas('canvasContainer')
    this.gameCanvas.init(this.gameMap, this.tileSet, spriteSheet)
    this.inputStatus = new InputStatus(this.gameMap, tileSet.tileWidth)

    this.dialogOpen = false
    this._openWindow = null
    this.mouse = null
    this.lastCoord = null
    this.simNeededBudget = false
    this.isPaused = false
    this.lastBadMessageTime = null

    const self = this

    // if (!this.everClicked) {

    //   this.nagger = window.setTimeout(function () {
    //     self.dialogOpen = true
    //     self._openWindow = 'nagWindow'
    //     self.nagWindow.open()
    //   }, 30 * 60 * 1000)

    //   $('.nag').each(function () {
    //     $(this).click(function (e) {
    //       if (self.nagger !== null) {
    //         window.clearTimeout(self.nagger)
    //         self.nagger = null
    //         self.everClicked = true
    //       }

    //       return true
    //     })
    //   })
    // }

    // Initialise monsterTV

    // this.monsterTV = new MonsterTV(
    //   this.gameMap,
    //   tileSet,
    //   spriteSheet,
    //   this.gameCanvas.animationManager
    // )

    const opacityLayerID = 'opaque'

    // this.genericDialogClosure = genericDialogClosure.bind(this)

    // Hook up listeners to open/close evaluation window
    this.handleEvalRequest = makeWindowOpenHandler(
      'eval',
      function () {
        return [this.simulation.evaluation]
      }.bind(this)
    )

    this.evalWindow = new EvaluationWindow(opacityLayerID, 'evalWindow')
    this.evalWindow.addEventListener(
      Messages.EVAL_WINDOW_CLOSED,
      this.genericDialogClosure
    )
    this.inputStatus.addEventListener(
      Messages.EVAL_REQUESTED,
      this.handleEvalRequest.bind(this)
    )

    // ... and similarly for the budget window
    this.handleBudgetRequest = makeWindowOpenHandler(
      'budget',
      function () {
        const budgetData = {
          roadMaintenanceBudget: this.simulation.budget.roadMaintenanceBudget,
          roadRate: Math.floor(this.simulation.budget.roadPercent * 100),
          fireMaintenanceBudget: this.simulation.budget.fireMaintenanceBudget,
          fireRate: Math.floor(this.simulation.budget.firePercent * 100),
          policeMaintenanceBudget: this.simulation.budget.policeMaintenanceBudget,
          policeRate: Math.floor(this.simulation.budget.policePercent * 100),
          taxRate: this.simulation.budget.cityTax,
          totalFunds: this.simulation.budget.totalFunds,
          taxesCollected: this.simulation.budget.taxFund,
        }

        return [budgetData]
      }.bind(this)
    )

    this.budgetWindow = new BudgetWindow(opacityLayerID, 'budget')
    this.budgetWindow.addEventListener(
      Messages.BUDGET_WINDOW_CLOSED,
      this.handleBudgetWindowClosure.bind(this)
    )
    this.inputStatus.addEventListener(
      Messages.BUDGET_REQUESTED,
      this.handleBudgetRequest.bind(this)
    )

    // ... and also the disaster window
    this.handleDisasterRequest = makeWindowOpenHandler('disaster')
    this.disasterWindow = new DisasterWindow(opacityLayerID, 'disasterWindow')
    this.disasterWindow.addEventListener(
      Messages.DISASTER_WINDOW_CLOSED,
      this.handleDisasterWindowClosure.bind(this)
    )
    this.inputStatus.addEventListener(
      Messages.DISASTER_REQUESTED,
      this.handleDisasterRequest.bind(this)
    )

    // ... the debug window
    this.handleDebugRequest = makeWindowOpenHandler('debug')
    this.debugWindow = new DebugWindow(opacityLayerID, 'debugWindow')
    this.debugWindow.addEventListener(
      Messages.DEBUG_WINDOW_CLOSED,
      this.handleDebugWindowClosure.bind(this)
    )
    this.inputStatus.addEventListener(
      Messages.DEBUG_WINDOW_REQUESTED,
      this.handleDebugRequest.bind(this)
    )


    // ... the settings window
    this.handleSettingsRequest = makeWindowOpenHandler(
      'settings',
      function () {
        return [
          {
            autoBudget: this.simulation.budget.autoBudget,
            autoBulldoze: BaseTool.getAutoBulldoze(),
            speed: this.defaultSpeed,
            disasters: this.simulation.disasterManager.disastersEnabled,
          },
        ]
      }.bind(this)
    )
    this.settingsWindow = new SettingsWindow(opacityLayerID, 'settingsWindow')
    this.settingsWindow.addEventListener(
      Messages.SETTINGS_WINDOW_CLOSED,
      this.handleSettingsWindowClosure.bind(this)
    )
    this.inputStatus.addEventListener(
      Messages.SETTINGS_WINDOW_REQUESTED,
      this.handleSettingsRequest.bind(this)
    )

    // ... the screenshot window
    this.handleScreenshotRequest = makeWindowOpenHandler('screenshot')
    this.screenshotWindow = new ScreenshotWindow(
      opacityLayerID,
      'screenshotWindow'
    )
    this.screenshotWindow.addEventListener(
      Messages.SCREENSHOT_WINDOW_CLOSED,
      this.handleScreenshotWindowClosure.bind(this)
    )
    this.inputStatus.addEventListener(
      Messages.SCREENSHOT_WINDOW_REQUESTED,
      this.handleScreenshotRequest.bind(this)
    )

    // ... the screenshot link window
    this.screenshotLinkWindow = new ScreenshotLinkWindow(
      opacityLayerID,
      'screenshotLinkWindow'
    )
    this.screenshotLinkWindow.addEventListener(
      Messages.SCREENSHOT_LINK_CLOSED,
      this.genericDialogClosure
    )

    // ... the save confirmation window
    this.saveWindow = new SaveWindow(opacityLayerID, 'saveWindow')
    this.saveWindow.addEventListener(
      Messages.SAVE_WINDOW_CLOSED,
      this.genericDialogClosure
    )

    // // ... the nag confirmation window
    // this.nagWindow = new NagWindow(opacityLayerID, 'nagWindow')
    // this.nagWindow.addEventListener(
    //   Messages.NAG_WINDOW_CLOSED,
    //   this.genericDialogClosure
    // )

    // ... the touch warn window
    this.touchWindow = new TouchWarnWindow(opacityLayerID, 'touchWarnWindow')
    this.touchWindow.addEventListener(
      Messages.TOUCH_WINDOW_CLOSED,
      this.genericDialogClosure
    )

    // ... and finally the query window
    this.handleQueryRequest = makeWindowOpenHandler('query')
    this.queryWindow = new QueryWindow(opacityLayerID, 'queryWindow')
    this.queryWindow.addEventListener(
      Messages.QUERY_WINDOW_CLOSED,
      this.genericDialogClosure
    )
    this.inputStatus.addEventListener(
      Messages.QUERY_WINDOW_NEEDED,
      this.handleQueryRequest.bind(this)
    )

    // Listen for clicks on the save button
    this.inputStatus.addEventListener(
      Messages.SAVE_REQUESTED,
      this.handleSave.bind(this)
    )

    // Listen for front end messages
    this.simulation.addEventListener(
      Messages.FRONT_END_MESSAGE,
      this.processFrontEndMessage.bind(this)
    )

    // Listen for budget messages
    this.simulation.addEventListener(
      Messages.BUDGET_NEEDED,
      this.handleMandatoryBudget.bind(this)
    )

    // Listen for tool clicks
    this.inputStatus.addEventListener(
      Messages.TOOL_CLICKED,
      this.handleTool.bind(this)
    )

    // And pauses
    this.inputStatus.addEventListener(
      Messages.SPEED_CHANGE,
      this.handlePause.bind(this)
    )

    // And date changes
    // XXX Not yet activated

    this.simulation.addEventListener(Messages.DATE_UPDATED, this.onDateChange.bind(this))

    this.infoBar = InfoBar(
      'cclass',
      'population',
      'score',
      'funds',
      'date',
      'name'
    )
    const initialValues = {
      classification: this.simulation.evaluation.cityClass,
      population: this.simulation.evaluation.cityPop,
      score: this.simulation.evaluation.cityScore,
      funds: this.simulation.budget.totalFunds,
      date: this.simulation.getDate(),
      name: this.name,
    }
    this.infoBar(this.simulation, initialValues)

    this._notificationBar = new Notification(
      '#notifications',
      this.gameCanvas
    // Text.messageText[Messages.WELCOME]
    )

    // Track when various milestones are first reached
    this._reachedTown =
    this._reachedCity =
    this._reachedCapital =
    this._reachedMetropolis =
    this._reacedMegalopolis =
    false


    // this.congratsWindow = new CongratsWindow(opacityLayerID, 'congratsWindow')
    // this.congratsWindow.addEventListener(
    //   Messages.CONGRATS_WINDOW_CLOSED,
    //   this.genericDialogClosure
    // )

    // Listen for touches, so we can warn tablet users
    // this.touchListener = touchListener.bind(this)
    // window.addEventListener('touchstart', this.touchListener, false)

    /*
    const $tileSelect = $('#tilesetSelect')
    $tileSelect.on('change', (e) => {
      const name = e.target.value
      this.setTileset(name)
    })
    if ($tileSelect.val() !== 'earth') $tileSelect.val('earth')
  */

    // Unhide controls
    this.revealControls()

    this._notificationBar._element.toggle() // Hide welcome notification

    // Run the sim
    this.tick = tick.bind(this)
    this.tick()

    // Paint the map
    const debug = Config.debug || Config.gameDebug
    if (debug) {
      $('#debug').toggle()
      this.frameCount = 0
      this.animStart = new Date()
      this.lastElapsed = -1
    }

    this.commonAnimate = commonAnimate.bind(this)
    this.animate = (debug ? debugAnimate : this.commonAnimate).bind(this)
    this.animate()
  }

  save() {
    const saveData = { name: this.name, everClicked: this.everClicked }
    BaseTool.save(saveData)
    this.simulation.save(saveData)

    // console.log('Save', saveData)

    Storage.saveGame(saveData)
  }

  load(saveData) {
    this.name = saveData.name
    this.everClicked = saveData.everClicked
    BaseTool.load(saveData)
    this.simulation.load(saveData)
  }

  revealControls() {

    $('.initialHidden').each(function (e) {
      $(this).removeClass('initialHidden')
    })

    // this._notificationBar.news({ subject: Messages.WELCOME })
    this.rci.update({ residential: 750, commercial: 750, industrial: 750 })
  }

  genericDialogClosure() {
    this.dialogOpen = false
    this._openWindow = null
  }


  setTileset(name) {

    if (tileSetCache[name]) {
      this.tileSet = tileSetCache[name]
      this.gameCanvas.changeTileSet(this.tileSet)
      return
    }

    tileSetImage = tileSetImage || document.createElement('img')

    tileSetImage.src = `/images/tiles/${name}.png`

    tileSetImage.onload = () => {
      this.tileSet = tileSetCache[name] = new TileSet(
        tileSetImage,
        () => this.gameCanvas.changeTileSet(this.tileSet),
        () => delete tileSetCache[name]
      )
    }
  }


  onDateChange(date) {

    // if (date.month === 10 && Random.getChance(10))
    //   this.gameCanvas.changeTileSet(this.snowTileSet)
    // else if (date.month === 1) this.gameCanvas.changeTileSet(this.tileSet)

    // return

  // if (date.month % 6 === 0) {
  //   this.setTileset(
  //     tileNames[Math.round(Math.random() * tileNames.length)]
  //   )
  // }
  }


  handleDisasterWindowClosure(request) {
    this.dialogOpen = false

    if (request === DisasterWindow.DISASTER_NONE) return

    switch (request) {
      case DisasterWindow.DISASTER_MONSTER:
        this.simulation.spriteManager.makeMonster()
        break

      case DisasterWindow.DISASTER_FIRE:
        this.simulation.disasterManager.makeFire()
        break

      case DisasterWindow.DISASTER_FLOOD:
        this.simulation.disasterManager.makeFlood()
        break

      case DisasterWindow.DISASTER_CRASH:
        this.simulation.disasterManager.makeCrash()
        break

      case DisasterWindow.DISASTER_MELTDOWN:
        this.simulation.disasterManager.makeMeltdown()
        break

      case DisasterWindow.DISASTER_TORNADO:
        this.simulation.spriteManager.makeTornado()
    }
  }

  handleSettingsWindowClosure(actions) {
    this.dialogOpen = false

    for (let i = 0, l = actions.length; i < l; i++) {
      const a = actions[i]

      switch (a.action) {
        case SettingsWindow.AUTOBUDGET:
          this.simulation.budget.setAutoBudget(a.data)
          break

        case SettingsWindow.AUTOBULLDOZE:
          BaseTool.setAutoBulldoze(a.data)
          break

        case SettingsWindow.SPEED:
          this.defaultSpeed = a.data
          this.simulation.setSpeed(this.defaultSpeed)
          break

        case SettingsWindow.DISASTERS_CHANGED:
          this.simulation.disasterManager.disastersEnabled = a.data
          break

        default:
          console.warn('Unexpected action', a)
      }
    }
  }

  handleDebugWindowClosure(actions) {
    this.dialogOpen = false

    for (let i = 0, l = actions.length; i < l; i++) {
      const a = actions[i]

      switch (a.action) {
        case DebugWindow.ADD_FUNDS:
          this.simulation.budget.spend(-1000000)
          break

        default:
          console.warn('Unexpected action', a)
      }
    }
  }

  handleScreenshotWindowClosure(action) {
    this.dialogOpen = false

    if (action === null) return

    let dataURI
    if (action === ScreenshotWindow.SCREENSHOT_VISIBLE) { dataURI = this.gameCanvas.screenshotVisible() } else if (action === ScreenshotWindow.SCREENSHOT_ALL) { dataURI = this.gameCanvas.screenshotMap() }

    this.dialogOpen = true
    this._openWindow = 'screenshotLinkWindow'
    this.screenshotLinkWindow.open(dataURI)
  }

  handleBudgetWindowClosure(data) {
    this.dialogOpen = false

    if (!data.cancelled) {
      this.simulation.budget.roadPercent = data.roadPercent / 100
      this.simulation.budget.firePercent = data.firePercent / 100
      this.simulation.budget.policePercent = data.policePercent / 100
      this.simulation.budget.setTax(data.taxPercent - 0)
      if (this.simNeededBudget) {
        this.simulation.budget.doBudgetWindow()
        this.simNeededBudget = false
      } else {
        this.simulation.budget.updateFundEffects()
      }
    }
  }

  handleMandatoryBudget() {
    this.simNeededBudget = true
    this.handleBudgetRequest()
  }

  handleTool(data) {

    const x = data.x
    const y = data.y

    // Were was the tool clicked?
    const tileCoords = this.gameCanvas.canvasCoordinateToTileCoordinate(x, y)

    if (tileCoords === null) return

    const tool = this.inputStatus.currentTool

    const budget = this.simulation.budget
    const evaluation = this.simulation.evaluation

    // do it!
    tool.doTool(tileCoords.x, tileCoords.y, this.simulation.blockMaps)

    tool.modifyIfEnoughFunding(budget)

    switch (tool.result) {
      case tool.TOOLRESULT_NEEDS_BULLDOZE:
        console.log(Text.toolMessages.needsDoze)
        // $('#toolOutput').text(Text.toolMessages.needsDoze)
        break

      case tool.TOOLRESULT_NO_MONEY:
        console.log(Text.toolMessages.noMoney)
        // $('#toolOutput').text(Text.toolMessages.noMoney)
        break

      default:
    // $('#toolOutput').html('Tools')
    }
  }

  handleSave() {
    this.save()
    this.dialogOpen = true
    this._openWindow = 'saveWindow'
    this.saveWindow.open()
  }

  handlePause() {
  // XXX Currently only offer pause and run to the user
  // No real difference among the speeds until we optimise
  // the sim
    this.isPaused = !this.isPaused

    if (this.isPaused) this.simulation.setSpeed(Simulation.SPEED_PAUSED)
    else this.simulation.setSpeed(this.defaultSpeed)
  }

  handleInput() {
    if (!this.dialogOpen) {

      // Handle keyboard movement

      if (this.inputStatus.left) this.gameCanvas.moveWest()
      else if (this.inputStatus.up) this.gameCanvas.moveNorth()
      else if (this.inputStatus.right) this.gameCanvas.moveEast()
      else if (this.inputStatus.down) this.gameCanvas.moveSouth()
    }

    if (this.inputStatus.escape) {
    // We need to handle escape, as InputStatus won't know what dialogs are showing
      if (this.dialogOpen) {
        this.dialogOpen = false
        this[this._openWindow].close()
        this._openWindow = null
      } else this.inputStatus.clearTool()
    }
  }

  processFrontEndMessage(message) {
    const subject = message.subject
    const d = new Date()

    if (Text.goodMessages[subject] !== undefined) {

      let cMessage = this.name + ' is now a '

      switch (subject) {
        case Messages.REACHED_CAPITAL:
          if (!this._reachedCapital) {
            this._reachedCapital = true
            cMessage += 'capital!'
          }
          break

        case Messages.REACHED_CITY:
          if (!this._reachedCity) {
            this._reachedCity = true
            cMessage += 'city!'
          }
          break

        case Messages.REACHED_MEGALOPOLIS:
          if (!this._reachedMegalopolis) {
            this._reachedMegalopolis = true
            cMessage += 'megalopolis!'
          }
          break

        case Messages.REACHED_METROPOLIS:
          if (!this._reachedMetropolis) {
            this._reachedMetropolis = true
            cMessage += 'metropolis!'
          }
          break

        case Messages.REACHED_TOWN:
          if (!this._reachedTown) {
            this._reachedTown = true
            cMessage += 'town!'
          }
          break
      }

      if (
        this.lastBadMessageTime === null
      || d - this.lastBadMessageTime > disasterTimeout
      ) {
        this.lastBadMessageTime = null
        this._notificationBar.goodNews(message)
      // ./text.ts, messageText[Messages.REACHED_CITY] = 'Population has reached
      }

      if (cMessage !== this.name + ' is now a ') {
        console.log('Congratulations', cMessage)
      //   this.dialogOpen = true
      //   this._openWindow = 'congratsWindow'
      //   this.congratsWindow.open(cMessage)
      }

      return
    }

    // Show disaster if applicable
    if (this.monsterTV && message.data) {
      if (message.data.showable) {
        this.monsterTV.show(message.data.x, message.data.y)
      } else if (message.data.trackable) {
        this.monsterTV.track(message.data.x, message.data.y, message.data.sprite)
      }
    }

    if (Text.badMessages[subject] !== undefined) {

      this._notificationBar.badNews(message)
      if (Messages.DISASTER_MESSAGES.indexOf(message.subject) !== -1) { this.lastBadMessageTime = d }
      return
    }

    if (Text.neutralMessages[subject] !== undefined) {
      if (
        this.lastBadMessageTime === null
      || d - this.lastBadMessageTime > disasterTimeout
      ) {
        this.lastBadMessageTime = null
        this._notificationBar.news(message)
      }
      return
    }

    console.warn('Unexpected message: ', subject)
  }

  calculateMouseForPaint() {
  // Determine whether we need to draw a tool outline in the
  // canvas
    let mouse = null

    if (this.inputStatus.mouseX !== -1 && this.inputStatus.toolWidth > 0) {
      const tileCoords = this.gameCanvas.canvasCoordinateToTileOffset(
        this.inputStatus.mouseX,
        this.inputStatus.mouseY
      )
      if (tileCoords !== null) {
        mouse = {}

        mouse.x = tileCoords.x
        mouse.y = tileCoords.y

        // The inputStatus fields came from DOM attributes, so will be strings.
        // Coerce back to numbers.
        mouse.width = this.inputStatus.toolWidth - 0
        mouse.height = this.inputStatus.toolWidth - 0
        mouse.colour = this.inputStatus.toolColour || 'yellow'
      }
    }

    return mouse
  }

  calculateSpritesForPaint(canvas) {
    const origin = canvas.getTileOrigin()
    const spriteList = this.simulation.spriteManager.getSpritesInView(
      origin.x,
      origin.y,
      canvas.canvasWidth,
      canvas.canvasHeight
    )

    if (spriteList.length === 0) return null

    return spriteList
  }

}

export { Game }
