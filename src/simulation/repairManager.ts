import { BURNBIT, CONDBIT } from '../tiles/tileFlags'
import { RUBBLE, ROADBASE } from '../tiles/tileValues'

function RepairManager(map) {
  this._map = map
  this._actions = []
}

const isCallable = function (f) {
  return typeof f === 'function'
}

RepairManager.prototype.addAction = function (criterion, period, zoneSize) {
  this._actions.push({
    criterion,
    period,
    zoneSize,
  })
}

RepairManager.prototype.repairZone = function (x, y, zoneSize) {
  const centre = this._map.getTileValue(x, y)
  let tileValue = centre - zoneSize - 2

  for (let yy = -1; yy < zoneSize - 1; yy++) {
    for (let xx = -1; xx < zoneSize - 1; xx++) {
      tileValue++

      const current = this._map.getTile(x + xx, y + yy)
      if (current.isZone() || current.isAnimated()) continue

      const currentValue = current.getValue()
      if (currentValue < RUBBLE || currentValue >= ROADBASE) { this._map.setTile(x + xx, y + yy, tileValue, CONDBIT | BURNBIT) }
    }
  }
}

RepairManager.prototype.checkTile = function (x, y, cityTime) {
  for (let i = 0, l = this._actions.length; i < l; i++) {
    const current = this._actions[i]
    const period = current.period

    if ((cityTime & period) !== 0) continue

    const tile = this._map.getTile(x, y)
    const tileValue = tile.getValue()

    const callable = isCallable(current.criterion)
    if (callable && current.criterion.call(null, tile)) { this.repairZone(x, y, current.zoneSize) } else if (!callable && current.criterion === tileValue) { this.repairZone(x, y, current.zoneSize) }
  }
}

export { RepairManager }
