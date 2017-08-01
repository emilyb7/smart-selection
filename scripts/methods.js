/* methods -- used directly to format data */

// returns url of github profile and checks for errors
function gitify (handle) {
  if (handle.indexOf('github') > -1) return handle
  var url = 'https://github.com/' + handle
  return urlChecker(url, handle) // eslint-disable-line no-undef
}

// returns url of codewars profile and checks for errors
function codewarsify (handle) {
  if (handle.indexOf('codewars') > -1) return handle
  if (handle.length < 2) return handle
  var url = 'https://www.codewars.com/users/' + handle
  return urlChecker(url, handle) // eslint-disable-line no-undef
}

// returns url of FFC
function getFCCLink (handle) {
  if (handle.indexOf('freecodecamp') > -1) return handle
  var url = 'https://www.freecodecamp.com/' + handle
  return urlChecker(url, handle) // eslint-disable-line no-undef
}

// generic link checking function
function checkLink (url) {
  if (!url || url.split(' ').length > 1) return '✘'
  try {
    // eslint-disable-next-line no-undef
    var response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true
    }).getResponseCode()
  } catch (err) {
    return err + url
  }
  if (response === 403) return '=HYPERLINK("' + url + '", "pwd required")'
  if (response && response !== 200) return 'Error ' + response + ' ' + url
  return '=HYPERLINK("' + url + '", "link")'
}

// returns boolean value for yes no answers
function yesNo (value) {
  return bool(value.toLowerCase().indexOf('yes') > -1) // eslint-disable-line no-undef
}

function abv_rightToWork (str) {
  return str.indexOf('UK') > -1
    ? 'UK'
    : str.indexOf('Israel') > -1 ? 'IL' : 'no'
}

function checkCodingQuestion (answer) {
  return bool(answer === 'A = 20, B = 20') // eslint-disable-line no-undef
}

// abbreviates responses to question about educational background
function abv_education (str) {
  return str.indexOf('bachelor') > -1
    ? "Bachelor's"
    : str.indexOf('master') > -1
      ? "Master's"
      : str.indexOf('PhD') > -1 ? 'PhD' : 'High school'
}

// abbreviates responses to question about plans post FAC
function abv_plans (str) {
  return str.indexOf('freelance') > -1
    ? 'freelance'
    : str.indexOf('job') > -1
      ? 'apply for job'
      : str.indexOf('startup ideas with other') > -1
        ? 'startup ideas with others'
        : str.indexOf('own startup idea') > -1
          ? 'own startup idea'
          : str.indexOf('previous occupation') > -1
            ? 'previous ocucpation'
            : 'other'
}

var method1 = { name: 'gitify', fn: gitify }
var method2 = { name: 'codewarsify', fn: codewarsify }
var method3 = { name: 'getFCCLink', fn: getFCCLink }
var method4 = { name: 'checkLink', fn: checkLink }
var method5 = { name: 'yesNo', fn: yesNo }
var method6 = { name: 'abv_rightToWork', fn: abv_rightToWork }
var method7 = { name: 'checkCodingQuestion', fn: checkCodingQuestion }
var method8 = { name: 'abv_education', fn: abv_education }
var method9 = { name: 'abv_plans', fn: abv_plans }

var methods = [
  method1,
  method2,
  method3,
  method4,
  method5,
  method6,
  method7,
  method8,
  method9
]
