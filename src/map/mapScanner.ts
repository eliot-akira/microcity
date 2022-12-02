import { Tile } from '../tiles/tile'
import { FLOOD } from '../tiles/tileValues'

// Tile to be filled to avoid creating lots of GC-able objects
const tile = new Tile()

function MapScanner(map) {
  this._map = map
  this._actions = []
}

const isCallable = function (f) {
  return typeof f === 'function'
}

MapScanner.prototype.addAction = function (criterion, action) {
  this._actions.push({ criterion, action })
}

MapScanner.prototype.mapScan = function (startX, maxX, simData) {
  for (let y = 0; y < this._map.height; y++) {
    for (let x = startX; x < maxX; x++) {
      this._map.getTile(x, y, tile)
      const tileValue = tile.getValue()

      if (tileValue < FLOOD) continue

      if (tile.isConductive()) simData.powerManager.setTilePower(x, y)

      if (tile.isZone()) {
        simData.repairManager.checkTile(x, y, simData.cityTime)
        const powered = tile.isPowered()
        if (powered) simData.census.poweredZoneCount += 1
        else simData.census.unpoweredZoneCount += 1
      }

      for (let i = 0, l = this._actions.length; i < l; i++) {
        const current = this._actions[i]
        const callable = isCallable(current.criterion)

        if (callable && current.criterion.call(null, tile)) {
          current.action.call(null, this._map, x, y, simData)
          break
        } else if (!callable && current.criterion === tileValue) {
          current.action.call(null, this._map, x, y, simData)
          break
        }
      }
    }
  }
}

export { MapScanner }
