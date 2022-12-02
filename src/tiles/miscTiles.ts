import { Random } from '../random'
import { TileUtils } from './tileUtils'
import { DIRT, IZB, RADTILE } from './tileValues'
import { ZoneUtils } from '../zoneUtils'

const xDelta = [-1, 0, 1, 0]
const yDelta = [0, -1, 0, 1]

const fireFound = function (map, x, y, simData) {
  simData.census.firePop += 1

  if ((Random.getRandom16() & 3) !== 0) return

  // Try to set neighbouring tiles on fire as well
  for (let i = 0; i < 4; i++) {
    if (Random.getChance(7)) {
      const xTem = x + xDelta[i]
      const yTem = y + yDelta[i]

      if (map.testBounds(xTem, yTem)) {
        const tile = map.getTile(x, y)
        if (!tile.isCombustible()) continue

        if (tile.isZone()) {
          // Neighbour is a ione and burnable
          ZoneUtils.fireZone(map, x, y, simData.blockMaps)

          // Industrial zones etc really go boom
          if (tile.getValue() > IZB) simData.spriteManager.makeExplosionAt(x, y)
        }

        map.setTo(TileUtils.randomFire())
      }
    }
  }

  // Compute likelyhood of fire running out of fuel
  let rate = 10 // Likelyhood of extinguishing (bigger means less chance)
  let i = simData.blockMaps.fireStationEffectMap.worldGet(x, y)

  if (i > 100) rate = 1
  else if (i > 20) rate = 2
  else if (i > 0) rate = 3

  // Decide whether to put out the fire.
  if (Random.getRandom(rate) === 0) map.setTo(x, y, TileUtils.randomRubble())
}

const radiationFound = function (map, x, y, simData) {
  if (Random.getChance(4095)) map.setTile(x, y, DIRT, 0)
}

const floodFound = function (map, x, y, simData) {
  simData.disasterManager.doFlood(x, y, simData.blockMaps)
}

const MiscTiles = {
  registerHandlers: function (mapScanner, repairManager) {
    mapScanner.addAction(TileUtils.isFire, fireFound, true)
    mapScanner.addAction(RADTILE, radiationFound, true)
    mapScanner.addAction(TileUtils.isFlood, floodFound, true)
  },
}

export { MiscTiles }
