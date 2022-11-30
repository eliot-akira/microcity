import { Config } from './config'
import { SplashScreen } from './splashScreen'
import { TileSet } from './tileSet'
import { TileSetURI } from './tileSetURI'
import { TileSetSnowURI } from './tileSetSnowURI'

/*
 *
 * Our task in main is to load the tile image, create a TileSet from it, and then tell the SplashScreen to display
 * itself. We will never return here.
 *
 */

var fallbackImage, tileSet, snowTileSet

var onTilesLoaded = function () {
  onAllTilesLoaded()
  // var snowTiles = $('#snowtiles')[1]
  // snowTileSet = new TileSet(snowTiles, onAllTilesLoaded, onFallbackTilesLoaded)
}

var onAllTilesLoaded = function () {
  // Kick things off properly
  var sprites = $('#sprites')[0]
  if (sprites.complete) {
    $('#loadingBanner').css('display', 'none')
    var s = new SplashScreen(tileSet, snowTileSet, sprites)
  } else {
    window.setTimeout(onAllTilesLoaded, 0)
  }
}

// XXX Replace with an error dialog
var onFallbackError = function () {
  fallbackImage.onload = fallbackImage.onerror = null
  alert('Failed to load tileset!')
}

var onFallbackSnowLoad = function () {
  fallbackImage.onload = fallbackImage.onerror = null
  snowTileSet = new TileSet(fallbackImage, onAllTilesLoaded, onFallbackError)
}

var onFallbackTilesLoaded = function () {
  fallbackImage = new Image()
  fallbackImage.onload = onFallbackSnowLoad
  fallbackImage.onerror = onFallbackError
  fallbackImage.src = TileSetSnowURI
}

var onFallbackLoad = function () {
  fallbackImage.onload = fallbackImage.onerror = null
  tileSet = new TileSet(fallbackImage, onFallbackTilesLoaded, onFallbackError)
}

var tileSetError = function () {
  console.log('tileSetError')
  // We might be running locally in Chrome, which handles the security context of file URIs differently, which makes
  // things go awry when we try to create an image from a "tainted" canvas (one we've painted on). Let's try creating
  // the tileset by URI instead
  fallbackImage = new Image()
  fallbackImage.onload = onFallbackLoad
  fallbackImage.onerror = onFallbackError
  fallbackImage.src = TileSetURI
}

// Check for debug parameter in URL
Config.debug = false
// window.location.search
// .slice(1)
// .split('&')
// .some(function (param) {
//   return param.trim().toLowerCase() === 'debug=1'
// })

var tiles = $('#tiles')[0]

function createTileSet() {
  tileSet = new TileSet(tiles, onTilesLoaded, tileSetError)
}

if (tiles.complete) createTileSet()
tiles.onload = createTileSet

// var snowtiles = $('#snowtiles')[1]