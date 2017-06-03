(function () {
  let defaultState = {
    url: '',
    sheetId: '',
    sheetName: '',
    sheetNames: [],
    source: '',
    output: '',
    confirmed: false
  }

  var state = Object.assign({}, defaultState)

  function show (el) { return el.classList.remove('dn') }

  function hide (el) { return el.classList.add('dn') }

  function getStartSection (id, confirmed) {
    if (!id.length) return 'start-initial'
    if (id.length && !confirmed) return 'start-confirm'
    return 'start-reset'
  }

  function showStartSection (sections) {
    var section = getStartSection(state.sheetId, state.confirmed)
    sections.forEach(sec => {
      if (sec.id === section) show(sec)
      else hide(sec)
    })
  }

  function render () {
    console.log(state)
    var startDetails = document.querySelector('#start-reset')
    var startConfirm = document.querySelector('#start-confirm')
    var startInitial = document.querySelector('#start-initial')
    var sheetUrl = document.querySelector('#sheet-url')
    var selectSource = document.querySelector('#select-source')
    var selectOuput = document.querySelector('#select-output')
    var sheetDetails = document.querySelector('#details-section')
    var questionsSection = document.querySelector('#questions-section')
    var updateSection = document.querySelector('#update-section')

    var startSections = [ startDetails, startConfirm, startInitial ]
    showStartSection(startSections)

    sheetUrl.value = state.url

    if (state.sheetId.length) {
      document.querySelector('#sheetname').innerHTML = state.sheetName
    } else {
      sheetDetails.classList.add('dn')
      questionsSection.classList.add('dn')
      updateSection.classList.add('dn')
    }

    if (state.confirmed) {
      show(sheetDetails)

      if (state.sheetNames.length && state.confirmed && !selectSource.hasChildNodes()) {
        updateSelectFields('select-source', state.sheetNames)
      }
    }

    if (state.source.length) {
      selectSource.value = state.source

      selectOuput.disabled = false

      if (!selectOuput.hasChildNodes()) {
        updateSelectFields('select-output', state.sheetNames)
      }
    }

    if (state.output) {
      selectOuput.value = state.output
    }

    if (state.sheetNames && state.source && state.output) {
      show(questionsSection)

      if (state.sheetNames.indexOf('questions') > -1) {
        document.querySelector('#has-question-sheet').classList.remove('dn')
        document.querySelector('#no-question-sheet').classList.add('dn')
        updateSection.classList.remove('dn')
      } else {
        document.querySelector('#no-question-sheet').classList.remove('dn')
        document.querySelector('#has-question-sheet').classList.add('dn')
      }
    }
  }

  function confirm () {
    state.confirmed = true
    render()
  }

  function cancel () {
    state = Object.assign({}, defaultState)
    render()
  }

  function checkSheet () {
    if (!state.url.length) return
    google.script.run.withSuccessHandler(function (data) {
      if (data.error) return console.log(data.error)
      state.sheetId = data.id
      state.sheetName = data.name
      state.sheetNames = data.sheetNames
      render()
    }).getSheetName(state.url)
  }

  function updateSelectFields (id, sheetNames) {
    var field = document.getElementById(id)
    while (field.hasChildNodes()) {
      field.removeChild(field.firstChild)
    }

    var blank = document.createElement('option')
    field.appendChild(blank)

    sheetNames.forEach(function (name) {
      var o = document.createElement('option')
      o.innerHTML = name
      o.value = name
      field.appendChild(o)
    })
    render()
  }

  function setUrl (e) {
    state.url = e.target.value
    render()
  }

  function setSource (e) {
    state.source = e.target.value
    render()
  }

  function setOutput (e) {
    state.output = e.target.value
    render()
  }

  function createQuestions () {
    var sheetId = state.sheetId
    google.script.run.withSuccessHandler(function (done) {
      if (done) {
        console.log('success')
        state.sheetNames = state.sheetNames.concat('questions')
      } else console.log('failure')
      render()
    }).createQuestionsSheet(sheetId)
  }

  function updateSheet () {
    var source = document.querySelector('#select-source').value
    var output = document.querySelector('#select-output').value

    google.script.run.withSuccessHandler(function (done) {
      if (done) console.log('success')
      else console.log('failure')
    }).updateForeignSS(state.sheetId, source, output)
  }

  document.querySelector('#confirm').addEventListener('click', confirm)
  document.querySelector('#cancel').addEventListener('click', cancel)
  document.querySelector('#startover').addEventListener('click', cancel)
  document.querySelector('#check-sheet').addEventListener('click', checkSheet)
  document.querySelector('#select-source').addEventListener('change', setSource)
  document.querySelector('#select-output').addEventListener('change', setOutput)
  document.querySelector('#create-questions').addEventListener('click', createQuestions)
  document.querySelector('#sheet-url').addEventListener('change', setUrl)
  document.querySelector('#update').addEventListener('click', updateSheet)

  render()
})()
