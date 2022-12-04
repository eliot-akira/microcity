import { ModalWindow } from './modalWindow'
import { EVAL_WINDOW_CLOSED } from '../messages'
import { Text } from '../messages/text'

const evaluationFormID = '#evalButtons'
const evaluationOKID = '#evalOK'

const submit = function (e) {
  e.preventDefault()
  this.close()
}

const EvaluationWindow = ModalWindow(function () {
  $(evaluationFormID).on('submit', submit.bind(this))
})

EvaluationWindow.prototype.close = function () {
  this._emitEvent(EVAL_WINDOW_CLOSED)
  this._toggleDisplay()
}

EvaluationWindow.prototype._populateWindow = function (evaluation) {
  $('#evalYes').text(evaluation.cityYes)
  $('#evalNo').text(100 - evaluation.cityYes)
  for (let i = 0; i < 4; i++) {
    const problemNo = evaluation.getProblemNumber(i)
    if (problemNo !== null) {
      const text = Text.problems[problemNo]
      $('#evalProb' + (i + 1)).text(text)
      $('#evalProb' + (i + 1)).show()
    } else {
      $('#evalProb' + (i + 1)).hide()
    }
  }

  $('#evalPopulation').text(evaluation.cityPop)
  $('#evalMigration').text(evaluation.cityPopDelta)
  $('#evalValue').text(evaluation.cityAssessedValue)
  $('#evalLevel').text(Text.gameLevel[evaluation.gameLevel])
  $('#evalClass').text(Text.cityClass[evaluation.cityClass])
  $('#evalScore').text(evaluation.cityScore)
  $('#evalScoreDelta').text(evaluation.cityScoreDelta)
}

EvaluationWindow.prototype.open = function (evaluation) {
  this._populateWindow(evaluation)
  this._toggleDisplay()
}

export { EvaluationWindow }
