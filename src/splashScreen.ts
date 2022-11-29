// import { Config } from './config'
import { Game } from './game'
import { MapGenerator } from './mapGenerator'
import { Simulation } from './simulation'
// import { SplashCanvas } from './splashCanvas'
import { Storage } from './storage'

/*
 *
 * The SplashScreen is the first screen the player will see on launch. It is responsible for map generation,
 * placing UI on screen to allow the player to select a map or load a game, and finally launching the game.
 * This should not be called until the tiles and sprites have been loaded.
 *
 */

function SplashScreen(tileSet, snowTileSet, spriteSheet) {
  /**
   * Map size - TODO: Consolidate constants
   * @see gameMap.js, mapGenerator.js
   */
  this.mapWidth = 240 // 120
  this.mapHeight = 240 // 100

  this.tileSet = tileSet
  // this.snowTileSet = snowTileSet
  this.spriteSheet = spriteSheet
  this.map = MapGenerator(this.mapWidth, this.mapHeight)

  const savedGame = Storage.canStore && Storage.getSavedGame()

  console.log('savedGame')

  // Launch a new game
  var game = new Game(
    savedGame || this.map,
    this.tileSet,
    this.snowTileSet,
    this.spriteSheet,
    Simulation.LEVEL_EASY,
    'Microcity'
  )

  setInterval(function () {
    Storage.canStore && game.save()
  }, 3000)

  return;

  // Set up listeners on buttons. When play is clicked, we will move on to get the player's desired
  // difficulty level and city name before launching the game properly
  $('#splashGenerate').click(regenerateMap.bind(this))
  $('#splashPlay').click(acquireNameAndDifficulty.bind(this))
  $('#splashLoad').click(handleLoad.bind(this))

  // Conditionally enable load/save buttons
  $('#saveRequest').prop('disabled', !Storage.canStore)
  $('#splashLoad').prop(
    'disabled',
    !(Storage.canStore && Storage.getSavedGame() !== null)
  )

  // Paint the minimap
  this.splashCanvas = new SplashCanvas('splashContainer', tileSet)
  this.splashCanvas.paint(this.map)

  // Let's get some bits on screen!
  $('.awaitGeneration').toggle()
  $('#splashPlay').focus()
}

// Generate a new map at the user's request, and paint it
var regenerateMap = function (e) {
  e.preventDefault()

  this.map = MapGenerator(this.mapWidth, this.mapHeight)
  this.splashCanvas.paint(this.map)
}

// Fetches game data from the storage manager, and launches the game. We won't return from here
var handleLoad = function (e) {
  e.preventDefault()

  var savedGame = Storage.getSavedGame()

  console.log(savedGame)

  if (savedGame === null) return

  // Remove installed event listeners
  $('#splashLoad').off('click')
  $('#splashGenerate').off('click')
  $('#splashPlay').off('click')

  // Hide the splashscreen UI
  $('#splash').toggle()

  // Launch
  var g = new Game(
    savedGame,
    this.tileSet,
    this.snowTileSet,
    this.spriteSheet,
    Simulation.LEVEL_EASY,
    name
  )
}

// After a map has been selected, call this function to display a form asking the user for
// a city name and difficulty level.
var acquireNameAndDifficulty = function (e) {
  e.preventDefault()

  // Remove the initial event listeners
  $('#splashLoad').off('click')
  $('#splashGenerate').off('click')
  $('#splashPlay').off('click')

  // Get rid of the initial splash screen
  $('#splash').toggle()

  // As a convenience, the city name is not mandatory in debug mode
  if (Config.debug) $('#nameForm').removeAttr('required')

  // When the form is submitted, we'll be ready to launch the game
  $('#playForm').submit(play.bind(this))

  // Display the name and difficulty form
  $('#start').toggle()
  $('#nameForm').focus()
}

// This function should be called after the name/difficulty form has been submitted. The game will now be launched
// with the map selected earlier.
var play = function (e) {
  e.preventDefault()

  // As usual, uninstall event listeners, and hide the UI
  $('#playForm').off('submit')
  $('#start').toggle()

  // What values did the player specify?
  var difficulty = $('.difficulty:checked').val() - 0
  var name = $('#nameForm').val()

  // Launch a new game
  var g = new Game(
    this.map,
    this.tileSet,
    this.snowTileSet,
    this.spriteSheet,
    difficulty,
    name
  )
}

export { SplashScreen }
