import { Tile } from './tile'
import { FLOOD } from './tileValues'

// Tile to be filled to avoid creating lots of GC-able objects
var tile = new Tile()

function MapScanner(map) {
  this._map = map
  this._actions = []
}

var isCallable = function (f) {
  return typeof f === 'function'
}

MapScanner.prototype.addAction = function (criterion, action) {
  this._actions.push({ criterion: criterion, action: action })
}

MapScanner.prototype.mapScan = function (startX, maxX, simData) {
  for (var y = 0; y < this._map.height; y++) {
    for (var x = startX; x < maxX; x++) {
      this._map.getTile(x, y, tile)
      var tileValue = tile.getValue()

      if (tileValue < FLOOD) continue

      if (tile.isConductive()) simData.powerManager.setTilePower(x, y)

      if (tile.isZone()) {
        simData.repairManager.checkTile(x, y, simData.cityTime)
        var powered = tile.isPowered()
        if (powered) simData.census.poweredZoneCount += 1
        else simData.census.unpoweredZoneCount += 1
      }

      for (var i = 0, l = this._actions.length; i < l; i++) {
        var current = this._actions[i]
        var callable = isCallable(current.criterion)

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
