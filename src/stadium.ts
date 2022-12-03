import { ANIMBIT, POWERBIT } from './tiles/tileFlags'
import {
  FOOTBALLGAME1,
  FOOTBALLGAME2,
  FULLSTADIUM,
  STADIUM,
} from './tiles/tileValues'

const emptyStadiumFound = function (map, x, y, simData) {
  simData.census.stadiumPop += 1

  if (map.getTile(x, y).isPowered()) {
    // Occasionally start the big game
    if (((simData.cityTime + x + y) & 31) === 0) {
      map.putZone(x, y, FULLSTADIUM, 4)
      map.addTileFlags(x, y, POWERBIT)
      map.setTile(x + 1, y, FOOTBALLGAME1, ANIMBIT)
      map.setTile(x + 1, y + 1, FOOTBALLGAME2, ANIMBIT)
    }
  }
}

const fullStadiumFound = function (map, x, y, simData) {
  simData.census.stadiumPop += 1
  const isPowered = map.getTile(x, y).isPowered()

  if (((simData.cityTime + x + y) & 7) === 0) {
    map.putZone(x, y, STADIUM, 4)
    if (isPowered) map.addTileFlags(x, y, POWERBIT)
  }
}

const Stadium = {
  registerHandlers: function (mapScanner, repairManager) {
    mapScanner.addAction(STADIUM, emptyStadiumFound)
    mapScanner.addAction(FULLSTADIUM, fullStadiumFound)
    repairManager.addAction(STADIUM, 15, 4)
  },
}

export { Stadium }
