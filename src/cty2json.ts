// Based on https://github.com/tom-konda/cty2json

export default function cty2json(data: ArrayBuffer) {

  const SHORT_BYTE_LENGTH = 2
  const DEFAULT_WIDTH = 120
  const DEFAULT_HEIGHT = 100
  const SOME_EDITION_FILESIZE = 27120
  let offset = 0

  const cityData = {
    fileSize: 0,
    historyData: {},
    miscData: {},
    tileData: new Array(DEFAULT_HEIGHT),
  }

  if (data.byteLength > SOME_EDITION_FILESIZE) {
    // Set 128-byte offset because of following comment in Micropolis.java.
    // ref: https://github.com/jason17055/micropolis-java/blob/9f6ddb4b5f36a005fe4c4f77488d7969eabf0797/src/micropolisj/engine/Micropolis.java#L2254
    // some editions of the classic Simcity game
    // start the file off with a 128-byte header,
    // but otherwise use the same format as us,
    // so read in that 128-byte header and continue
    // as before.
    offset = 128
  }

  cityData.fileSize = data.byteLength
  const HISTORY_DATA_COUNT = 240
  const HALF_HISTORY_DATA_COUNT = HISTORY_DATA_COUNT / 2
  const HISTORY_DATA_BYTE = HISTORY_DATA_COUNT * SHORT_BYTE_LENGTH
  // Get history graph data from city
  const getHistoryData = (property: keyof historyData) => {
    const historyData = data.slice(offset, offset + HISTORY_DATA_BYTE)
    const currentHistoryData = cityData.historyData
    const propertyData: {[property: string]: historyGraphData} = {
      [property]: {
        '10years': [],
        '120years': [],
      }
    }
    for (let i = 0; i < HISTORY_DATA_COUNT; ++i) {
      if (i < HALF_HISTORY_DATA_COUNT) {
        propertyData[property]['10years'].unshift(new DataView(historyData, i * SHORT_BYTE_LENGTH, SHORT_BYTE_LENGTH).getInt16(0, false))
      } else {
        propertyData[property]['120years'].unshift(new DataView(historyData, i * SHORT_BYTE_LENGTH, SHORT_BYTE_LENGTH).getInt16(0, false))
      }
    }
    cityData.historyData = {
      ...currentHistoryData,
      ...propertyData,
    }
    offset += HISTORY_DATA_BYTE
  }

  getHistoryData('residential')
  getHistoryData('commercial')
  getHistoryData('industrial')
  getHistoryData('crime')
  getHistoryData('pollution')
  getHistoryData('landValue')
  const MISC_DATA_COUNT = 120
  const MISC_DATA_BYTE = MISC_DATA_COUNT * SHORT_BYTE_LENGTH
  const miscData = data.slice(offset, offset + MISC_DATA_BYTE)
  offset += MISC_DATA_BYTE

  const getMiscData = (property: keyof miscData, miscOffset: number, length: number) => {
    const currentMiscData = cityData.miscData
    let value = 0
    switch (length) {
      case 1:
        value = new DataView(miscData, miscOffset * SHORT_BYTE_LENGTH, SHORT_BYTE_LENGTH).getInt16(0, false)
        break
      case 2:
        value = new DataView(miscData, miscOffset * SHORT_BYTE_LENGTH, SHORT_BYTE_LENGTH * 2).getInt32(0, false)
    }
    cityData.miscData = {
      ...currentMiscData,
      ...{ [property]: value },
    }
  }
  getMiscData('RPopulation', 2, 1)
  getMiscData('CPopulation', 3, 1)
  getMiscData('IPopulation', 4, 1)
  getMiscData('RValve', 5, 1)
  getMiscData('CValve', 6, 1)
  getMiscData('IValve', 7, 1)
  getMiscData('cityTime', 8, 2)
  getMiscData('crimeRamp', 10, 1)
  getMiscData('polluteRamp', 11, 1)
  getMiscData('landValueAve', 12, 1)
  getMiscData('crimeAve', 13, 1)
  getMiscData('pollutionAve', 14, 1)
  getMiscData('gameLevel', 15, 1)
  getMiscData('cityClass', 16, 1)
  getMiscData('cityScore', 17, 1)
  getMiscData('budget', 50, 2)
  getMiscData('autoBulldoze', 52, 1)
  getMiscData('autoBudget', 53, 1)
  getMiscData('autoGoto', 54, 1)
  getMiscData('soundOn', 55, 1)
  getMiscData('tax', 56, 1)
  getMiscData('gameSpeed', 57, 1)
  // Following three values are ratio of n to 65536
  getMiscData('policeCovered', 58, 2)
  getMiscData('fireCovered', 60, 2)
  getMiscData('transportCovered', 62, 2)

  const MAP_DATA_COUNT = DEFAULT_WIDTH * DEFAULT_HEIGHT
  const MAP_DATA_BYTE = MAP_DATA_COUNT * SHORT_BYTE_LENGTH
  const tileData = data.slice(offset, offset + MAP_DATA_BYTE)

  // Get Tile Data
  for (let y = 0; y < DEFAULT_HEIGHT; ++y) {
    cityData.tileData[y] = []
    for (let x = 0; x < DEFAULT_WIDTH; ++x) {
      const tile = new DataView(tileData, (x * DEFAULT_HEIGHT + y) * SHORT_BYTE_LENGTH, SHORT_BYTE_LENGTH).getInt16(0, false)
      cityData.tileData[y][x] = {
        building: tile & 1023,
        zoneCenter: Boolean(tile >> 10 & 1),
        animated: Boolean(tile >> 11 & 1),
        bulldozable: Boolean(tile >> 12 & 1),
        combustible: Boolean(tile >> 13 & 1),
        conductive: Boolean(tile >> 14 & 1),
      }
    }
  }

  return cityData
}
