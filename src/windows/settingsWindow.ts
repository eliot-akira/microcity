import { SETTINGS_WINDOW_CLOSED } from '../messages'
import { ModalWindow } from './modalWindow'
import { MiscUtils } from '../utils'
import { Simulation } from '../simulation'

const settingsCancelID = '#settingsCancel'
const settingsFormID = '#settingsForm'
const settingsOKID = '#settingsOK'
const autoBudgetYesID = '#autoBudgetYes'
const autoBudgetNoID = '#autoBudgetNo'
const autoBulldozeYesID = '#autoBulldozeYes'
const autoBulldozeNoID = '#autoBulldozeNo'
const speedSlowID = '#speedSlow'
const speedMedID = '#speedMed'
const speedFastID = '#speedFast'
const disastersYesID = '#disastersYes'
const disastersNoID = '#disastersNo'

const cancel = function (e) {
  e.preventDefault()
  this.close([])
}

const submit = function (e) {
  e.preventDefault()

  const actions = []

  let shouldAutoBudget = $('.autoBudgetSetting:checked').val()
  if (shouldAutoBudget === 'true') shouldAutoBudget = true
  else shouldAutoBudget = false
  actions.push({ action: SettingsWindow.AUTOBUDGET, data: shouldAutoBudget })

  let shouldAutoBulldoze = $('.autoBulldozeSetting:checked').val()
  if (shouldAutoBulldoze === 'true') shouldAutoBulldoze = true
  else shouldAutoBulldoze = false
  actions.push({
    action: SettingsWindow.AUTOBULLDOZE,
    data: shouldAutoBulldoze,
  })

  const speed = $('.speedSetting:checked').val() - 0
  actions.push({ action: SettingsWindow.SPEED, data: speed })

  let shouldEnableDisasters = $('.enableDisastersSetting:checked').val()
  if (shouldEnableDisasters === 'true') shouldEnableDisasters = true
  else shouldEnableDisasters = false
  actions.push({
    action: SettingsWindow.DISASTERS_CHANGED,
    data: shouldEnableDisasters,
  })

  this.close(actions)
}


const SettingsWindow = ModalWindow(function () {
  $(settingsCancelID).on('click', cancel.bind(this))
  $(settingsFormID).on('submit', submit.bind(this))
})

SettingsWindow.prototype.close = function (actions) {
  actions = actions || []
  this._emitEvent(SETTINGS_WINDOW_CLOSED, actions)
  this._toggleDisplay()
}

SettingsWindow.prototype.open = function (settingsData) {
  if (settingsData.autoBudget) $(autoBudgetYesID).prop('checked', true)
  else $(autoBudgetNoID).prop('checked', true)

  if (settingsData.autoBulldoze) $(autoBulldozeYesID).prop('checked', true)
  else $(autoBulldozeNoID).prop('checked', true)

  if (settingsData.speed === Simulation.SPEED_SLOW) { $(speedSlowID).prop('checked', true) } else if (settingsData.speed === Simulation.SPEED_MED) { $(speedMedID).prop('checked', true) } else $(speedFastID).prop('checked', true)

  if (settingsData.disasters) $(disastersYesID).prop('checked', true)
  else $(disastersNoID).prop('checked', true)

  this._toggleDisplay()
}

const defineAction = (function () {
  let uid = 0

  return function (name) {
    Object.defineProperty(
      SettingsWindow,
      name,
      MiscUtils.makeConstantDescriptor(uid)
    )
    uid += 1
  }
})()

defineAction('AUTOBUDGET')
defineAction('AUTOBULLDOZE')
defineAction('SPEED')
defineAction('DISASTERS_CHANGED')

export { SettingsWindow }
