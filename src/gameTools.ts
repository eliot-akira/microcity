import { BuildingTool } from './buildingTool'
import { BulldozerTool } from './bulldozerTool'
import { EventEmitter } from './eventEmitter'
import { QUERY_WINDOW_NEEDED } from './messages'
import { MiscUtils } from './miscUtils'
import { ParkTool } from './parkTool'
import { RailTool } from './railTool'
import { RoadTool } from './roadTool'
import { QueryTool } from './queryTool'
import * as TileValues from './tileValues'
import { WireTool } from './wireTool'

function GameTools(map) {
  var tools = EventEmitter({
    airport: new BuildingTool(10000, TileValues.AIRPORT, map, 6, false),
    bulldozer: new BulldozerTool(map),
    coal: new BuildingTool(3000, TileValues.POWERPLANT, map, 4, false),
    commercial: new BuildingTool(100, TileValues.COMCLR, map, 3, false),
    fire: new BuildingTool(500, TileValues.FIRESTATION, map, 3, false),
    industrial: new BuildingTool(100, TileValues.INDCLR, map, 3, false),
    nuclear: new BuildingTool(5000, TileValues.NUCLEAR, map, 4, true),
    park: new ParkTool(map),
    police: new BuildingTool(500, TileValues.POLICESTATION, map, 3, false),
    port: new BuildingTool(3000, TileValues.PORT, map, 4, false),
    rail: new RailTool(map),
    residential: new BuildingTool(100, TileValues.FREEZ, map, 3, false),
    road: new RoadTool(map),
    query: new QueryTool(map),
    stadium: new BuildingTool(5000, TileValues.STADIUM, map, 4, false),
    wire: new WireTool(map),
  })

  tools.query.addEventListener(
    QUERY_WINDOW_NEEDED,
    MiscUtils.reflectEvent.bind(tools, QUERY_WINDOW_NEEDED)
  )

  return tools
}

export { GameTools }
