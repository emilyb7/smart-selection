// returns data from CodeWars API (honor, kyu in JS, number of kata authored)
function getCodewarsData (user) {
  var url = 'https://www.codewars.com/api/v1/users/' + user
  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true })
  var userData = JSON.parse(response)
  if (!userData) return ['✘', '✘', 0]
  var honor = userData.honor
  try {
    var kyu = (userData.ranks.languages.javascript.name || '✘')
    var kataAuthored = userData.codeChallenges.totalAuthored
  } catch (err) {
    Logger.log(err)
  }
  return [honor || '✘', kyu || '✘', kataAuthored || 0]
}
