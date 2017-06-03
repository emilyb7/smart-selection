const show = el => el.classList.remove('dn')
const hide = el => el.classList.add('dn')

const getStartSection = (id, confirmed) =>
  !id.length
  ? 'start-initial'
  : id.length && !confirmed
    ? 'start-confirm'
    : 'start-reset'

const showStartSection = (sections, sheetId, confirmed, url, name) => {
  const sheetUrl = document.querySelector('#sheet-url')
  const section = getStartSection(sheetId, confirmed)
  if (section === 'start-initial') sheetUrl.value = url
  else if (section === 'start-confirm') document.querySelector('#sheetname').innerHTML = name
  sections.forEach(sect => {
    if (sect.id === section) show(sect)
    else hide(sect)
  })
}

const getQuestionsSection = (names, created) => {
  if (names.indexOf('questions') > -1) return 'has-question-sheet'
  else if (!created) return 'no-question-sheet'
  else return 'questions-created'
}

const showQuestionsSection = (sections, names, created) => {
  const section = getQuestionsSection(names, created)
  sections.forEach(sect => {
    if (sect.id === section) show(sect)
    else hide(sect)
  })
}

const updateSelectFields = (id, sheetNames) => {
  let field = document.getElementById(id)

  while (field.hasChildNodes()) {
    field.removeChild(field.firstChild)
  }

  const blank = document.createElement('option')
  field.appendChild(blank)

  sheetNames.forEach(name => {
    let o = document.createElement('option')
    o.innerHTML = name
    o.value = name
    field.appendChild(o)
  })
}

const renderSections = (sections, step) => {
  const currentSection = sections[step]
  const previousSections = sections.slice(0, step)
  const nextSections = sections.slice(step + 1)

  show(currentSection)

  previousSections.forEach((section) => {
    show(section)
  })

  nextSections.forEach(section => {
    hide(section)
  })
}

const disableAll = () => {
  const elements = [].slice
    .call(document.querySelectorAll('button'), 0)
    .concat([].slice.call(document.querySelectorAll('select'), 0))
  elements.forEach(e => { e.disabled = true })
}

const waterfall = (args, tasks, cb) => {
  var nextTask = tasks[0]
  var remainingTasks = tasks.slice(1)
  if (typeof nextTask !== 'undefined') {
    nextTask(args, (result) => {
      if (result.error) return cb(result.error)
      return waterfall(result.success, remainingTasks, cb)
    })
    return
  }
  return cb(null, args)
}
