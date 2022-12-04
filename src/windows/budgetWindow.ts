import { BUDGET_WINDOW_CLOSED } from '../messages'
import { MiscUtils } from '../utils'
import { ModalWindow } from './modalWindow'

const dataKeys = [
  'roadMaintenanceBudget',
  'fireMaintenanceBudget',
  'policeMaintenanceBudget',
]
const spendKeys = ['roadRate', 'fireRate', 'policeRate']

const budgetResetID = '#budgetReset'
const budgetCancelID = '#budgetCancel'
const budgetFormID = '#budgetForm'
const budgetOKID = '#budgetOK'

const setSpendRangeText = function (element, percentage, totalSpend) {
  const labelID = element + 'Label'
  const cash = Math.floor(totalSpend * (percentage / 100))
  const text = [percentage, '% of $', totalSpend, ' = $', cash].join('')
  $(MiscUtils.normaliseDOMid(labelID)).text(text)
}

const onFundingUpdate = function (elementID, e) {
  const element = $(MiscUtils.normaliseDOMid(elementID))[0]
  const percentage = element.value - 0
  const dataSource = element.getAttribute('data-source')
  setSpendRangeText(elementID, percentage, this[dataSource])
}

const onTaxUpdate = function (e) {
  const elem = $('#taxRateLabel')[0]
  const sourceElem = $('#taxRate')[0]
  $(elem).text(['Tax rate: ', sourceElem.value, '%'].join(''))
}

const resetItems = function (e) {
  for (let i = 0; i < spendKeys.length; i++) {
    const original = this['original' + spendKeys[i]]
    $(MiscUtils.normaliseDOMid(spendKeys[i]))[0].value = original
    setSpendRangeText(spendKeys[i], original, this[dataKeys[i]])
  }
  $('#taxRate')[0].value = this.originaltaxRate
  onTaxUpdate()

  e.preventDefault()
}

const cancel = function (e) {
  e.preventDefault()
  this.close({ cancelled: true })
}

const submit = function (e) {
  e.preventDefault()

  // Get element values
  const roadPercent = $('#roadRate')[0].value
  const firePercent = $('#fireRate')[0].value
  const policePercent = $('#policeRate')[0].value
  const taxPercent = $('#taxRate')[0].value

  const data = {
    cancelled: false,
    roadPercent,
    firePercent,
    policePercent,
    taxPercent,
    e,
    original: e.type,
  }
  this.close(data)
}

const BudgetWindow = ModalWindow(function () {
  $(budgetCancelID).on('click', cancel.bind(this))
  $(budgetResetID).on('click', resetItems.bind(this))
  $(budgetFormID).on('submit', submit.bind(this))
})

BudgetWindow.prototype.close = function (data) {
  data = data || { cancelled: true }
  this._emitEvent(BUDGET_WINDOW_CLOSED, data)
  this._toggleDisplay()
}

BudgetWindow.prototype.open = function (budgetData) {
  let i, elem

  // Store max funding levels
  for (i = 0; i < dataKeys.length; i++) {
    if (budgetData[dataKeys[i]] === undefined) { throw new Error('Missing budget data (' + dataKeys[i] + ')') }
    this[dataKeys[i]] = budgetData[dataKeys[i]]
  }

  // Update form elements with percentages, and set up listeners
  for (i = 0; i < spendKeys.length; i++) {
    if (budgetData[spendKeys[i]] === undefined) { throw new Error('Missing budget data (' + spendKeys[i] + ')') }

    elem = spendKeys[i]
    this['original' + elem] = budgetData[elem]
    setSpendRangeText(elem, budgetData[spendKeys[i]], this[dataKeys[i]])
    elem = $(MiscUtils.normaliseDOMid(elem))
    elem.on('change', onFundingUpdate.bind(this, spendKeys[i]))
    elem = elem[0]
    elem.value = budgetData[spendKeys[i]]
  }

  if (budgetData.taxRate === undefined) { throw new Error('Missing budget data (taxRate)') }

  this.originalTaxRate = budgetData.taxRate
  elem = $('#taxRate')
  elem.on('change', onTaxUpdate)
  elem = elem[0]
  elem.value = budgetData.taxRate
  onTaxUpdate()

  // Update static parts
  const previousFunds = budgetData.totalFunds
  if (previousFunds === undefined) { throw new Error('Missing budget data (previousFunds)') }

  const taxesCollected = budgetData.taxesCollected
  if (taxesCollected === undefined) { throw new Error('Missing budget data (taxesCollected)') }

  const cashFlow =
    taxesCollected
    - this.roadMaintenanceBudget
    - this.fireMaintenanceBudget
    - this.policeMaintenanceBudget
  const currentFunds = previousFunds + cashFlow
  $('#taxesCollected').text('$' + taxesCollected)
  $('#cashFlow').text((cashFlow < 0 ? '-$' : '$') + cashFlow)
  $('#previousFunds').text((previousFunds < 0 ? '-$' : '$') + previousFunds)
  $('#currentFunds').text('$' + currentFunds)

  this._toggleDisplay()
}

export { BudgetWindow }
