import * as Messages from './messages'
import { MiscUtils } from './utils'
import { Text } from './messages/text'

// TODO L20N

const InfoBar = function (classification, population, score, funds, date, name) {
  const classificationSelector = MiscUtils.normaliseDOMid(classification)
  const populationSelector = MiscUtils.normaliseDOMid(population)
  const scoreSelector = MiscUtils.normaliseDOMid(score)
  const fundsSelector = MiscUtils.normaliseDOMid(funds)
  const dateSelector = MiscUtils.normaliseDOMid(date)
  const nameSelector = MiscUtils.normaliseDOMid(name)

  return function (dataSource, initialValues) {
    $(classificationSelector).text(initialValues.classification)
    $(populationSelector).text(initialValues.population)
    $(scoreSelector).text(initialValues.score)
    $(fundsSelector).text(initialValues.funds)
    $(dateSelector).text(
      [Text.months[initialValues.date.month], initialValues.date.year].join(' ')
    )
    $(nameSelector).text(initialValues.name)

    // Add the various listeners
    dataSource.addEventListener(
      Messages.CLASSIFICATION_UPDATED,
      function (classification) {
        $(classificationSelector).text(classification)
      }
    )

    dataSource.addEventListener(
      Messages.POPULATION_UPDATED,
      function (population) {
        $(populationSelector).text(population)
      }
    )

    dataSource.addEventListener(Messages.SCORE_UPDATED, function (score) {
      $(scoreSelector).text(score)
    })

    dataSource.addEventListener(Messages.FUNDS_CHANGED, function (funds) {
      $(fundsSelector).text(funds)
    })

    dataSource.addEventListener(Messages.DATE_UPDATED, function (date) {
      $(dateSelector).text(
        `Year ${date.year} ${Text.months[date.month]}`
        // [Text.months[date.month], date.year].join(', Year '))
      )
    })
  }
}

export { InfoBar }
