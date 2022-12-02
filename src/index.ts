import { Config } from './config'
import { TileSet } from './tiles/tileSet'
import { MapGenerator } from './map/mapGenerator'
import { Simulation } from './simulation'
import { Storage } from './storage'
import { Game } from './game'

const tiles = document.getElementById('tiles')
const sprites = document.getElementById('sprites')

function createTileSet() {
  const tileSet = new TileSet(
    tiles,
    function onLoad() {
      function onSpritesReady() {
        createGame(tileSet, sprites)
      }
      if (sprites.complete) {
        onSpritesReady()
      } else {
        sprites.onload = onSpritesReady
      }

    },
    function onError() {
      console.error('Failed to load tileset')
    }
  )
}

if (tiles.complete) createTileSet()
tiles.onload = createTileSet

function createGame(tileSet, spriteSheet) {
  /**
   * Map size - TODO: Consolidate constants
   * @see gameMap.js, mapGenerator.js
   */
  const mapWidth = 120 // 120
  const mapHeight = 100 // 100

  const map = MapGenerator(mapWidth, mapHeight)

  const savedGame = Storage.canStore && Storage.getSavedGame()

  // Launch a new game
  const game = new Game(
    savedGame || map,
    tileSet,
    null,
    spriteSheet,
    Simulation.LEVEL_EASY,
    'Microcity'
  )

  setInterval(function () {
    Storage.canStore && game.save()
  }, 3000)



}