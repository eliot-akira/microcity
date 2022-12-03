import { Position } from '../map/position'
import { FIRESTATION, POLICESTATION } from '../tiles/tileValues'

const handleService = function (censusStat, budgetEffect, blockMap) {
  return function (map, x, y, simData) {
    simData.census[censusStat] += 1

    let effect = simData.budget[budgetEffect]
    const isPowered = map.getTile(x, y).isPowered()
    // Unpowered buildings are half as effective
    if (!isPowered) effect = Math.floor(effect / 2)

    const pos = new Position(x, y)
    const connectedToRoads = simData.trafficManager.findPerimeterRoad(pos)
    if (!connectedToRoads) effect = Math.floor(effect / 2)

    let currentEffect = simData.blockMaps[blockMap].worldGet(x, y)
    currentEffect += effect
    simData.blockMaps[blockMap].worldSet(x, y, currentEffect)
  }
}

const policeStationFound = handleService(
  'policeStationPop',
  'policeEffect',
  'policeStationMap'
)
const fireStationFound = handleService(
  'fireStationPop',
  'fireEffect',
  'fireStationMap'
)

const EmergencyServices = {
  registerHandlers: function (mapScanner, repairManager) {
    mapScanner.addAction(POLICESTATION, policeStationFound)
    mapScanner.addAction(FIRESTATION, fireStationFound)
  },
}

export { EmergencyServices }
