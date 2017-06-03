(function () {
  const startSection = document.querySelector('#section-start')
  const startDetails = document.querySelector('#start-reset')
  const startConfirm = document.querySelector('#start-confirm')
  const startInitial = document.querySelector('#start-initial')
  const confirmBtn = document.querySelector('#confirm')
  const cancelBtn = document.querySelector('#cancel')
  const selectSource = document.querySelector('#select-source')
  const selectOuput = document.querySelector('#select-output')
  const sheetDetails = document.querySelector('#details-section')
  const questionsSection = document.querySelector('#questions-section')
  const updateSection = document.querySelector('#update-section')

  const startSections = [ startDetails, startConfirm, startInitial ]

  const stepSections = [ startSection, sheetDetails, questionsSection, updateSection ]

  const defaultState = {
    url: '',
    sheetId: '',
    sheetName: '',
    sheetNames: [],
    source: '',
    output: '',
    confirmed: false,
    step: 0
  }

  let state = Object.assign({}, defaultState)

  function render () {
    console.log(state)

    renderSections(stepSections, state.step)

    showStartSection(startSections, state.sheetId, state.confirmed, state.url, state.sheetName)

    if (state.sheetNames.length && state.confirmed && !selectSource.hasChildNodes()) {
      updateSelectFields('select-source', state.sheetNames)
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
      document.getElementById('confirm-sheets').disabled = false
    }

    if (state.step === 2 && state.sheetNames.length) {
      const quPartials = []
        .slice
        .call(document.querySelectorAll('.qu-partial'), 0)

      showQuestionsSection(quPartials, state.sheetNames, state.questionsCreated)
    }
  }

  const confirm = () => {
    state = Object.assign({}, state, { confirmed: true, step: 1 })
    render()
  }

  const cancel = () => {
    state = Object.assign({}, defaultState)
    render()
  }

  const confirmSheets = () => {
    state = Object.assign({}, state, { step: 2 })
    render()
  }

  const confirmQuestions = () => {
    state = Object.assign({}, state, { step: 3 })
    render()
  }

  const setSource = e => {
    state.source = e.target.value
    render()
  }

  const setOutput = e => {
    state.output = e.target.value
    render()
  }

  const setUrl = e => {
    state.url = e.target.value
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

  function createQuestions () {
    var sheetId = state.sheetId
    google.script.run.withSuccessHandler(function (done) {
      if (done) {
        console.log('success')
        state.questionsCreated = true
      } else console.log('failure')
      render()
    }).createQuestionsSheet(sheetId)
  }

  function updateSheet () {
    google.script.run.withSuccessHandler(function (done) {
      if (done) console.log('success')
      else console.log('failure')
    }).updateForeignSS(state.sheetId, state.source, state.output)
  }

  confirmBtn.addEventListener('click', confirm)
  cancelBtn.addEventListener('click', cancel)
  document.querySelectorAll('.confirm-questions').forEach(el => {
    el.addEventListener('click', confirmQuestions)
  })
  document.querySelector('#startover').addEventListener('click', cancel)
  document.querySelector('#check-sheet').addEventListener('click', checkSheet)
  selectSource.addEventListener('change', setSource)
  selectOuput.addEventListener('change', setOutput)
  document.querySelector('#create-questions').addEventListener('click', createQuestions)
  document.querySelector('#sheet-url').addEventListener('change', setUrl)
  document.querySelector('#update').addEventListener('click', updateSheet)
  document.querySelector('#confirm-sheets').addEventListener('click', confirmSheets)

  render()
})()
