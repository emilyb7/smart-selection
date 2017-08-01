function getSheetName (url) {
  var ss
  if (!url) return { error: 'no url provided' }
  try {
    ss = SpreadsheetApp.openByUrl(url) // eslint-disable-line no-undef
  } catch (err) {
    return { error: 'invalid sheet url' }
  }

  var name = ss.getName()
  var id = ss.getId()
  var sheets = ss.getSheets()
  var sheetNames = sheets.map(function (s) {
    return s.getName()
  })
  return {
    id: id,
    name: name,
    sheetNames: sheetNames
  }
}

function createQuestionsSheet (id) {
  var sheet = sourceSS.getSheetByName('questions') // eslint-disable-line no-undef
  var template = sheet
    .getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
    .getValues()

  if (!id || !id.length) return false

  var ss = SpreadsheetApp.openById(id) // eslint-disable-line no-undef
  var questions = ss.insertSheet('questions')
  questions
    .getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
    .setValues(template)
  return true
}

/* functions used to update sheet --> called in final function */
function getQuestions (sheet) {
  // first 3 columns from sheet containing questions, returns valid questions
  return sheet
    .getRange(1, 1, sheet.getLastRow(), 3)
    .getValues()
    .map(function (row) {
      return {
        title: row[0],
        formQuestion: row[1],
        fn: row[2]
      }
    })
    .filter(function (question) {
      return question.title
    })
}

function applyHeaders (data, target) {
  var titles = data.map(function (question) {
    return question.title
  })
  var targetRange = target.getRange(1, 1, 1, data.length)
  targetRange.setValues([titles])
  targetRange.setBackgroundColor('#4286f4').setFontWeight('bold').setWrap(true)
}

function getFunction (name) {
  // eslint-disable-next-line no-undef
  var method = methods.filter(function (method) {
    return method.name === name
  })
  if (!method.length) {
    return function (x) {
      return x
    }
  }
  var fn = method[0].fn
  if (!fn) {
    return function (x) {
      return x
    }
  }
  return fn
}

function getApplicantResponses (question, applicantData) {
  if (!question.formQuestion) return []
  var questionIndex = applicantData[0].indexOf(question.formQuestion)
  if (questionIndex < 0) return []
  // eslint-disable-next-line no-undef
  return (answers = applicantData.slice(1).map(function (applicant) {
    return applicant[questionIndex]
  }))
}

function insertAnswers (data, index, target) {
  if (!data.length) return
  var targetRange = target.getRange(2, index, data.length)
  targetRange.setValues(
    data.map(function (element) {
      return [element]
    })
  )
}

// fills out data from codewars API
function insertCodewarsData (spreadsheetId, output) {
  var ss = SpreadsheetApp.openById(spreadsheetId) // eslint-disable-line no-undef
  var sheet = ss.getSheetByName(output)
  var questions = getQuestions(ss.getSheetByName('questions'))
  var data = sheet
    .getRange(1, 1, sheet.getLastRow(), questions.length)
    .getValues()
  var headers = data[0]
  var nameIndex = headers.indexOf('codewars name')
  if (nameIndex < 0) return

  var q1Index = headers.indexOf('codewars honour')
  var q2Index = headers.indexOf('codewars kyu')
  var q3Index = headers.indexOf('codewars kata authored')

  data.slice(1).forEach(function (applicant, index) {
    var username = applicant[nameIndex]
    var codewarsData = getCodewarsData(username) // eslint-disable-line no-undef
    sheet.getRange(index + 2, q1Index + 1).setValue(codewarsData[0])
    sheet.getRange(index + 2, q2Index + 1).setValue(codewarsData[1])
    sheet.getRange(index + 2, q3Index + 1).setValue(codewarsData[2])
  })

  return {
    success: 'data successfully fetched from codewars, running final checks...'
  }
}

// fills out 'meets criteria' column
function evaluateCriteria (spreadsheetId, output) {
  var ss = SpreadsheetApp.openById(spreadsheetId) // eslint-disable-line no-undef
  var sheet = ss.getSheetByName(output)
  var questions = getQuestions(ss.getSheetByName('questions'))
  var data = sheet
    .getRange(1, 1, sheet.getLastRow(), questions.length)
    .getValues()
  var headers = data[0]
  var colIndex = headers.indexOf('meets criteria')
  if (colIndex < 0) return

  var kyuIndex = headers.indexOf('codewars kyu')
  var websiteIndex = headers.indexOf('github repo')
  var videoIndex = headers.indexOf('video link')
  var gitIndex = headers.indexOf('github handle')

  data.slice(1).forEach(function (applicant, index) {
    var isEligible =
      checkCodewars(applicant[kyuIndex]) && // eslint-disable-line no-undef
      noError(applicant[websiteIndex]) && // eslint-disable-line no-undef
      noError(applicant[videoIndex]) && // eslint-disable-line no-undef
      noError(applicant[gitIndex]) // eslint-disable-line no-undef

    var cell = sheet.getRange(index + 2, colIndex + 1)
    cell.setValue(bool(isEligible)) // eslint-disable-line no-undef
    cell.setFontColor(isEligible ? '#5add5d' : '#dd5a9b')
  })

  return {
    success: 'applicant eligibility updated'
  }
}

function setUpSheet (spreadsheetId, outputSheet) {
  var ss = SpreadsheetApp.openById(spreadsheetId) // eslint-disable-line no-undef
  var output = ss.getSheetByName(outputSheet)

  output.clearContents()
  output.setFrozenRows(1)
  return {
    success: 'Existing spreadsheet cleared of data'
  }
}

function insertData (spreadsheetId, sourceSheet, outputSheet) {
  var ss = SpreadsheetApp.openById(spreadsheetId) // eslint-disable-line no-undef
  var source = ss.getSheetByName(sourceSheet)
  var output = ss.getSheetByName(outputSheet)
  var qu = ss.getSheetByName('questions')

  // source data
  var sourceData = source
    .getRange(1, 1, source.getLastRow(), source.getLastColumn())
    .getValues()

  // get questions from qu sheet
  var questions = getQuestions(qu)

  // apply headers
  applyHeaders(questions, output)

  // for each question >>
  questions.forEach(function (question, index) {
    // get result from source data
    var applicantResponses = getApplicantResponses(question, sourceData)
    if (question.fn) {
      var fn = getFunction(question.fn)
      applicantResponses = applicantResponses.map(fn)
    }

    insertAnswers(applicantResponses, index + 1, output)
  })

  return {
    success:
      'applicant data copied into output sheet, getting data from codewars'
  }
}

function applyFormatting (spreadsheetId, outputSheet) {
  var ss = SpreadsheetApp.openById(spreadsheetId) // eslint-disable-line no-undef
  var output = ss.getSheetByName(outputSheet)

  var sheetBody = output.getRange(
    2,
    1,
    output.getLastRow(),
    output.getLastColumn()
  )

  sheetBody.setHorizontalAlignment('center')

  sheetBody.getValues().forEach(function (row, index) {
    if (index % 2) return
    var sheetRow = output.getRange(index + 2, 1, 1, output.getLastColumn())
    sheetRow.setBackground('#d4e2f7')
  })

  return {
    success: 'custom formatting applied'
  }
}
