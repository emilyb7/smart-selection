/* helper functions -- called by methods below */

function bool (value) {
  return value ? '✓' : '✘'
}

function urlChecker (url, handle) {
  // eslint-disable-next-line no-undef
  var response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true
  }).getResponseCode()
  if (response !== 200) return 'Error ' + response + ' ' + handle
  return '=HYPERLINK("' + url + '", "' + handle + '")'
}

function checkCodewars (str) {
  return parseInt(str[0]) <= 5
}

function noError (str) {
  return str.split(' ')[0] !== 'Error'
}
