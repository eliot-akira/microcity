import { Random } from './random'
import { SPRITE_SHIP } from './sprites/spriteConstants'
import { ANIMBIT, CONDBIT, BURNBIT } from './tiles/tileFlags'
import { TileUtils } from './tiles/tileUtils'
import * as TileValues from './tiles/tileValues'

const railFound = function (map, x, y, simData) {
  simData.census.railTotal += 1
  simData.spriteManager.generateTrain(simData.census, x, y)

  if (simData.budget.shouldDegradeRoad()) {
    if (Random.getChance(511)) {
      const currentTile = map.getTile(x, y)

      // Don't degrade tiles with power lines
      if (currentTile.isConductive()) return

      if (simData.budget.roadEffect < (Random.getRandom16() & 31)) {
        const mapValue = currentTile.getValue()

        // Replace bridge tiles with water, otherwise rubble
        if (mapValue < TileValues.RAILBASE + 2) { map.setTile(x, y, TileValues.RIVER, 0) } else map.setTo(x, y, TileUtils.randomRubble())
      }
    }
  }
}

const airportFound = function (map, x, y, simData) {
  simData.census.airportPop += 1

  const tile = map.getTile(x, y)
  if (tile.isPowered()) {
    if (map.getTileValue(x + 1, y - 1) === TileValues.RADAR) { map.setTile(x + 1, y - 1, TileValues.RADAR0, CONDBIT | ANIMBIT | BURNBIT) }

    if (Random.getRandom(5) === 0) {
      simData.spriteManager.generatePlane(x, y)
      return
    }

    if (Random.getRandom(12) === 0) simData.spriteManager.generateCopter(x, y)
  } else {
    map.setTile(x + 1, y - 1, TileValues.RADAR, CONDBIT | BURNBIT)
  }
}

const portFound = function (map, x, y, simData) {
  simData.census.seaportPop += 1

  const tile = map.getTile(x, y)
  if (tile.isPowered() && simData.spriteManager.getSprite(SPRITE_SHIP) === null) { simData.spriteManager.generateShip() }
}

const Transport = {
  registerHandlers: function (mapScanner, repairManager) {
    mapScanner.addAction(TileUtils.isRail, railFound)
    mapScanner.addAction(TileValues.PORT, portFound)
    mapScanner.addAction(TileValues.AIRPORT, airportFound)

    repairManager.addAction(TileValues.PORT, 15, 4)
    repairManager.addAction(TileValues.AIRPORT, 7, 6)
  },
}

export { Transport }
