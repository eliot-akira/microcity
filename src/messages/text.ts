import { Evaluation } from '../simulation/evaluation'
import * as Messages from './index'
import { Simulation } from '../simulation'

// TODO Some kind of rudimentary L20N based on navigator.language?

// Query tool strings
const densityStrings = ['Low', 'Medium', 'High', 'Very High']
const landValueStrings = ['Slum', 'Lower Class', 'Middle Class', 'High']
const crimeStrings = ['Safe', 'Light', 'Moderate', 'Dangerous']
const pollutionStrings = ['None', 'Moderate', 'Heavy', 'Very Heavy']
const rateStrings = ['Declining', 'Stable', 'Slow Growth', 'Fast Growth']
const zoneTypes = [
  'Clear',
  'Water',
  'Trees',
  'Rubble',
  'Flood',
  'Radioactive Waste',
  'Fire',
  'Road',
  'Power',
  'Rail',
  'Residential',
  'Commercial',
  'Industrial',
  'Seaport',
  'Airport',
  'Coal Power',
  'Fire Department',
  'Police Department',
  'Stadium',
  'Nuclear Power',
  'Draw Bridge',
  'Radar Dish',
  'Fountain',
  'Industrial',
  'Steelers 38  Bears 3',
  'Draw Bridge',
  'Ur 238',
]

// Evaluation window
const gameLevel = {}
gameLevel['' + Simulation.LEVEL_EASY] = 'Easy'
gameLevel['' + Simulation.LEVEL_MED] = 'Medium'
gameLevel['' + Simulation.LEVEL_HARD] = 'Hard'

const cityClass = {}
cityClass[Evaluation.CC_VILLAGE] = 'VILLAGE'
cityClass[Evaluation.CC_TOWN] = 'TOWN'
cityClass[Evaluation.CC_CITY] = 'CITY'
cityClass[Evaluation.CC_CAPITAL] = 'CAPITAL'
cityClass[Evaluation.CC_METROPOLIS] = 'METROPOLIS'
cityClass[Evaluation.CC_MEGALOPOLIS] = 'MEGALOPOLIS'

const problems = {}
problems[Evaluation.CRIME] = 'Crime'
problems[Evaluation.POLLUTION] = 'Pollution'
problems[Evaluation.HOUSING] = 'Housing'
problems[Evaluation.TAXES] = 'Taxes'
problems[Evaluation.TRAFFIC] = 'Traffic'
problems[Evaluation.UNEMPLOYMENT] = 'Unemployment'
problems[Evaluation.FIRE] = 'Fire'

// months
const months = [
  'January', // 'Jan',
  'February', // 'Feb',
  'March', // 'Mar',
  'April', // 'Apr',
  'May', // 'May',
  'June', // 'Jun',
  'July', // 'Jul',
  'August', // 'Aug',
  'September', // 'Sep',
  'October', // 'Oct',
  'November', // 'Nov',
  'December', // 'Dec',
]

// Tool strings
const toolMessages = {
  noMoney: 'Insufficient funds to build that',
  needsDoze: 'Area must be bulldozed first',
}

// Message strings
const neutralMessages = {}
neutralMessages[Messages.FIRE_STATION_NEEDS_FUNDING] = true
neutralMessages[Messages.NEED_AIRPORT] = true
neutralMessages[Messages.NEED_FIRE_STATION] = true
neutralMessages[Messages.NEED_ELECTRICITY] = true
neutralMessages[Messages.NEED_MORE_INDUSTRIAL] = true
neutralMessages[Messages.NEED_MORE_COMMERCIAL] = true
neutralMessages[Messages.NEED_MORE_RESIDENTIAL] = true
neutralMessages[Messages.NEED_MORE_RAILS] = true
neutralMessages[Messages.NEED_MORE_ROADS] = true
neutralMessages[Messages.NEED_POLICE_STATION] = true
neutralMessages[Messages.NEED_SEAPORT] = true
neutralMessages[Messages.NEED_STADIUM] = true
neutralMessages[Messages.ROAD_NEEDS_FUNDING] = true
neutralMessages[Messages.POLICE_NEEDS_FUNDING] = true
neutralMessages[Messages.WELCOME] = true

const badMessages = {}
badMessages[Messages.BLACKOUTS_REPORTED] = true
badMessages[Messages.EARTHQUAKE] = true
badMessages[Messages.EXPLOSION_REPORTED] = true
badMessages[Messages.FLOODING_REPORTED] = true
badMessages[Messages.FIRE_REPORTED] = true
badMessages[Messages.HEAVY_TRAFFIC] = true
badMessages[Messages.HELICOPTER_CRASHED] = true
badMessages[Messages.HIGH_CRIME] = true
badMessages[Messages.HIGH_POLLUTION] = true
badMessages[Messages.MONSTER_SIGHTED] = true
badMessages[Messages.NO_MONEY] = true
badMessages[Messages.NOT_ENOUGH_POWER] = true
badMessages[Messages.NUCLEAR_MELTDOWN] = true
badMessages[Messages.PLANE_CRASHED] = true
badMessages[Messages.SHIP_CRASHED] = true
badMessages[Messages.TAX_TOO_HIGH] = true
badMessages[Messages.TORNADO_SIGHTED] = true
badMessages[Messages.TRAFFIC_JAMS] = true
badMessages[Messages.TRAIN_CRASHED] = true

const goodMessages = {}
goodMessages[Messages.REACHED_CAPITAL] = true
goodMessages[Messages.REACHED_CITY] = true
goodMessages[Messages.REACHED_MEGALOPOLIS] = true
goodMessages[Messages.REACHED_METROPOLIS] = true
goodMessages[Messages.REACHED_TOWN] = true

const messageText = {}
messageText[Messages.FIRE_STATION_NEEDS_FUNDING] =
  'Fire departments need funding'
messageText[Messages.NEED_AIRPORT] = 'Commerce requires an Airport'
messageText[Messages.NEED_FIRE_STATION] = 'Citizens demand a Fire Department'
messageText[Messages.NEED_ELECTRICITY] = 'Build a Power Plant'
messageText[Messages.NEED_MORE_INDUSTRIAL] = 'More industrial zones needed'
messageText[Messages.NEED_MORE_COMMERCIAL] = 'More commercial zones needed'
messageText[Messages.NEED_MORE_RESIDENTIAL] = 'More residential zones needed'
messageText[Messages.NEED_MORE_RAILS] = 'Inadequate rail system'
messageText[Messages.NEED_MORE_ROADS] = 'More roads required'
messageText[Messages.NEED_POLICE_STATION] =
  'Citizens demand a Police Department'
messageText[Messages.NEED_SEAPORT] = 'Industry requires a Sea Port'
messageText[Messages.NEED_STADIUM] = 'Residents demand a Stadium'
messageText[Messages.ROAD_NEEDS_FUNDING] =
  'Roads deteriorating, due to lack of funds'
messageText[Messages.POLICE_NEEDS_FUNDING] = 'Police departments need funding'
messageText[Messages.WELCOME] = 'Welcome to micropolisJS'
messageText[Messages.BLACKOUTS_REPORTED] =
  'Brownouts, build another Power Plant'
messageText[Messages.EARTHQUAKE] = 'Major earthquake reported !!'
messageText[Messages.EXPLOSION_REPORTED] = 'Explosion detected '
messageText[Messages.FLOODING_REPORTED] = 'Flooding reported !'
messageText[Messages.FIRE_REPORTED] = 'Fire reported '
messageText[Messages.HEAVY_TRAFFIC] = 'Heavy traffic reported'
messageText[Messages.HELICOPTER_CRASHED] = 'A helicopter crashed '
messageText[Messages.HIGH_CRIME] = 'Crime very high'
messageText[Messages.HIGH_POLLUTION] = 'Pollution very high'
messageText[Messages.MONSTER_SIGHTED] = 'A Monster has been sighted !'
messageText[Messages.NO_MONEY] = 'YOUR CITY HAS GONE BROKE'
messageText[Messages.NOT_ENOUGH_POWER] =
  'Blackouts reported: insufficient power capacity'
messageText[Messages.NUCLEAR_MELTDOWN] = 'A Nuclear Meltdown has occurred !!'
messageText[Messages.PLANE_CRASHED] = 'A plane has crashed '
messageText[Messages.SHIP_CRASHED] = 'Shipwreck reported '
messageText[Messages.TAX_TOO_HIGH] = 'Citizens upset. The tax rate is too high'
messageText[Messages.TORNADO_SIGHTED] = 'Tornado reported !'
messageText[Messages.TRAFFIC_JAMS] = 'Frequent traffic jams reported'
messageText[Messages.TRAIN_CRASHED] = 'A train crashed '
messageText[Messages.REACHED_CAPITAL] = 'Population has reached 50,000'
messageText[Messages.REACHED_CITY] = 'Population has reached 10,000'
messageText[Messages.REACHED_MEGALOPOLIS] = 'Population has reached 500,000'
messageText[Messages.REACHED_METROPOLIS] = 'Population has reached 100,000'
messageText[Messages.REACHED_TOWN] = 'Population has reached 2,000'

const Text = {
  badMessages,
  cityClass,
  crimeStrings,
  densityStrings,
  gameLevel,
  goodMessages,
  landValueStrings,
  messageText,
  months,
  neutralMessages,
  problems,
  pollutionStrings,
  rateStrings,
  toolMessages,
  zoneTypes,
}

export { Text }
