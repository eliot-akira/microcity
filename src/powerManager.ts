import { BlockMap } from './map/blockMap'
import { forEachCardinalDirection } from './map/direction'
import { EventEmitter } from './eventEmitter'
import { Position } from './map/position'
import { NOT_ENOUGH_POWER } from './messages'
import { Random } from './random'
import { ANIMBIT, BURNBIT, CONDBIT, POWERBIT } from './tiles/tileFlags'
import { NUCLEAR, POWERPLANT } from './tiles/tileValues'

const COAL_POWER_STRENGTH = 700
const NUCLEAR_POWER_STRENGTH = 2000

const PowerManager = EventEmitter(function (map) {
  this._map = map
  this._powerStack = []
  this.powerGridMap = new BlockMap(this._map.width, this._map.height, 1)
})

PowerManager.prototype.setTilePower = function (x, y) {
  const tile = this._map.getTile(x, y)
  const tileValue = tile.getValue()

  if (
    tileValue === NUCLEAR
    || tileValue === POWERPLANT
    || this.powerGridMap.worldGet(x, y) > 0
  ) {
    tile.addFlags(POWERBIT)
    return
  }

  tile.removeFlags(POWERBIT)
}

PowerManager.prototype.clearPowerStack = function () {
  this._powerStackPointer = 0
  this._powerStack = []
}

PowerManager.prototype.testForConductive = function (pos, testDir) {
  const movedPos = Position.move(pos, testDir)

  if (this._map.isPositionInBounds(movedPos)) {
    if (this._map.getTile(movedPos.x, movedPos.y).isConductive()) {
      if (this.powerGridMap.worldGet(movedPos.x, movedPos.y) === 0) return true
    }
  }

  return false
}

// Note: the algorithm is buggy: if you have two adjacent power
// plants, the second will be regarded as drawing power from the first
// rather than as a power source itself
PowerManager.prototype.doPowerScan = function (census) {
  // Clear power this._map.
  this.powerGridMap.clear()

  // Power that the combined coal and nuclear power plants can deliver.
  const maxPower =
    census.coalPowerPop * COAL_POWER_STRENGTH
    + census.nuclearPowerPop * NUCLEAR_POWER_STRENGTH

  let powerConsumption = 0 // Amount of power used.

  while (this._powerStack.length > 0) {
    var pos = this._powerStack.pop()
    var anyDir = undefined
    var conNum
    do {
      powerConsumption++
      if (powerConsumption > maxPower) {
        this._emitEvent(NOT_ENOUGH_POWER)
        return
      }

      if (anyDir) pos = Position.move(pos, anyDir)

      this.powerGridMap.worldSet(pos.x, pos.y, 1)
      conNum = 0

      forEachCardinalDirection((dir) => {
        if (conNum >= 2) {
          return
        }

        if (this.testForConductive(pos, dir)) {
          conNum++
          anyDir = dir
        }
      })

      if (conNum > 1) this._powerStack.push(new Position(pos.x, pos.y))
    } while (conNum)
  }
}

PowerManager.prototype.coalPowerFound = function (map, x, y, simData) {
  simData.census.coalPowerPop += 1

  this._powerStack.push(new Position(x, y))

  // Ensure animation runs
  const dX = [-1, 2, 1, 2]
  const dY = [-1, -1, 0, 0]

  for (let i = 0; i < 4; i++) map.addTileFlags(x + dX[i], y + dY[i], ANIMBIT)
}

const dX = [1, 2, 1, 2]
const dY = [-1, -1, 0, 0]
const meltdownTable = [30000, 20000, 10000]

PowerManager.prototype.nuclearPowerFound = function (map, x, y, simData) {
  // TODO With the auto repair system, zone gets repaired before meltdown
  // In original Micropolis code, we bail and don't repair if melting down
  if (
    simData.disasterManager.disastersEnabled
    && Random.getRandom(meltdownTable[simData.gameLevel]) === 0
  ) {
    simData.disasterManager.doMeltdown(x, y)
    return
  }

  simData.census.nuclearPowerPop += 1
  this._powerStack.push(new Position(x, y))

  // Ensure animation bits set
  for (let i = 0; i < 4; i++) { map.addTileFlags(x, y, ANIMBIT | CONDBIT | POWERBIT | BURNBIT) }
}

PowerManager.prototype.registerHandlers = function (mapScanner, repairManager) {
  mapScanner.addAction(POWERPLANT, this.coalPowerFound.bind(this))
  mapScanner.addAction(NUCLEAR, this.nuclearPowerFound.bind(this))
  repairManager.addAction(POWERPLANT, 7, 4)
  repairManager.addAction(NUCLEAR, 7, 4)
}

export { PowerManager }
