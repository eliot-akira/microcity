import { MiscUtils } from '../utils'
import { TileUtils } from '../tiles/tileUtils'
import { DIRT, HBRIDGE, LASTTINYEXP, TINYEXP } from '../tiles/tileValues'
import { WorldEffects } from '../stats/worldEffects'

const init = function (cost, map, shouldAutoBulldoze, isDraggable) {
  isDraggable = isDraggable || false
  Object.defineProperty(
    this,
    'toolCost',
    MiscUtils.makeConstantDescriptor(cost)
  )
  this.result = null
  this.isDraggable = isDraggable
  this._shouldAutoBulldoze = shouldAutoBulldoze
  this._map = map
  this._worldEffects = new WorldEffects(map)
  this._applicationCost = 0
}

const clear = function () {
  this._applicationCost = 0
  this._worldEffects.clear()
}

const addCost = function (cost) {
  this._applicationCost += cost
}

const doAutoBulldoze = function (x, y) {
  let tile = this._worldEffects.getTile(x, y)
  if (tile.isBulldozable()) {
    tile = TileUtils.normalizeRoad(tile.getValue())
    if (
      (tile >= TINYEXP && tile <= LASTTINYEXP)
      || (tile < HBRIDGE && tile !== DIRT)
    ) {
      this.addCost(1)
      this._worldEffects.setTile(x, y, DIRT)
    }
  }
}

const apply = function (budget) {
  this._worldEffects.apply()
  budget.spend(this._applicationCost)
  this.clear()
}

const modifyIfEnoughFunding = function (budget) {
  if (this.result !== this.TOOLRESULT_OK) {
    this.clear()
    return false
  }

  if (budget.totalFunds < this._applicationCost) {
    this.result = this.TOOLRESULT_NO_MONEY
    this.clear()
    return false
  }

  apply.call(this, budget)
  this.clear()
  return true
}

const TOOLRESULT_OK = 0
const TOOLRESULT_FAILED = 1
const TOOLRESULT_NO_MONEY = 2
const TOOLRESULT_NEEDS_BULLDOZE = 3

const BaseToolConstructor = {
  addCost,
  autoBulldoze: true,
  bulldozerCost: 1,
  clear,
  doAutoBulldoze,
  init,
  modifyIfEnoughFunding,
  TOOLRESULT_OK,
  TOOLRESULT_FAILED,
  TOOLRESULT_NO_MONEY,
  TOOLRESULT_NEEDS_BULLDOZE,
}

const BaseTool = {
  makeTool,
  setAutoBulldoze: function (value) {
    BaseToolConstructor.autoBulldoze = value
  },
  getAutoBulldoze: function () {
    return BaseToolConstructor.autoBulldoze
  },
  save,
  load,
}

function save(saveData) {
  saveData.autoBulldoze = BaseToolConstructor.autoBulldoze
}

function load(saveData) {
  BaseTool.autoBulldoze = saveData.autoBulldoze
}

function makeTool(toolConstructor) {
  toolConstructor.prototype = Object.create(BaseToolConstructor)
  return toolConstructor
}

export { BaseTool }
