function getSheetName (url) {
  var ss;
  if (!url) return { error: "no url provided", };
  try {
    ss = SpreadsheetApp.openByUrl(url);
  } catch (err) {
    return { error: "invalid sheet url", };
  }

  var name = ss.getName();
  var id = ss.getId();
  var sheets = ss.getSheets();
  var sheetNames = sheets.map(function(s) { return s.getName(); });
  return {
    id: id,
    name: name,
    sheetNames: sheetNames,
  };
}

function createQuestionsSheet(id) {

  var sourceSS = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1PkA_OFGjly-XpuDCe3DutgCQhjMMHOCSoUxBTkC71y8/edit#gid=0");
  var sheet = sourceSS.getSheetByName("questions");
  var template = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();

  if (!id || !id.length) return false;

  var ss = SpreadsheetApp.openById(id);
  var questions = ss.insertSheet("questions");
  questions.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).setValues(template);
  return true;
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

/* helper functions -- called by methods below */

function bool(value) { return value ? '✓' : '✘'; };

function urlChecker(url, handle) {
  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true, }).getResponseCode();
  if (response !== 200) return "Error " + response + " " + handle;
  return '=HYPERLINK("' + url + '", "' +  handle + '")';
}

function checkCodewars(str) { return parseInt(str[0]) <= 5; }

function noError(str) { return str.split(" ")[0] !== "Error"; }

/* methods -- used directly to format data */

// returns url of github profile and checks for errors
function gitify (handle) {
  if (handle.indexOf('github') > -1) return handle;
  var url = "https://github.com/" + handle;
  return urlChecker(url, handle);
}

// returns url of codewars profile and checks for errors
function codewarsify (handle) {
  if (handle.indexOf('codewars') > -1) return handle;
  if (handle.length < 2) return handle;
  var url = "https://www.codewars.com/users/" + handle;
  return urlChecker(url, handle);
}

// returns url of FFC
function getFCCLink (handle) {
  if (handle.indexOf('freecodecamp') > -1) return handle;
  var url = "https://www.freecodecamp.com/" + handle;
  return urlChecker(url, handle);
}

// generic link checking function
function checkLink (url) {
  if(!url || url.split(" ").length > 1) return "✘";
  try {
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getResponseCode();
  } catch (err) {
    return err + url;
  }
  if (response === 403) return '=HYPERLINK("' + url + '", "pwd required")';
  if (response && response !== 200) return "Error " + response + " " + url;
  return '=HYPERLINK("' + url + '", "link")';
}

// returns boolean value for yes no answers
function yesNo(value) { return bool(value.toLowerCase().indexOf('yes') > -1); }

function abv_rightToWork(str) {
  Logger.log(str);
  return str.indexOf("UK") > -1
  ? "UK"
  : str.indexOf("Israel") > -1
  ? "IL"
  : 'no';
}

function checkCodingQuestion(answer) { return bool(answer === "A = 20, B = 20"); }

// abbreviates responses to question about educational background
function abv_education (str) {
  return str.indexOf("bachelor") > -1 ? "Bachelor's" :
  str.indexOf("master") > -1 ? "Master's" :
  str.indexOf("PhD") > -1 ? "PhD" :
  "High school";
}

// abbreviates responses to question about plans post FAC
function abv_plans (str) {
  return str.indexOf("freelance") > -1 ? "freelance" :
  str.indexOf("job") > -1 ? "apply for job" :
  str.indexOf("startup ideas with other") > -1 ? "startup ideas with others" :
  str.indexOf("own startup idea") > -1 ? "own startup idea" :
  str.indexOf("previous occupation") > -1 ? "previous ocucpation" :
  "other";
}


var method1 = { name: 'gitify', fn: gitify, };
var method2 = { name: 'codewarsify', fn: codewarsify, };
var method3 = { name: 'getFCCLink', fn: getFCCLink, };
var method4 = { name: 'checkLink', fn: checkLink, };
var method5 = { name: 'yesNo', fn: yesNo, };
var method6 = { name: 'abv_rightToWork', fn: abv_rightToWork, };
var method7 = { name: 'checkCodingQuestion', fn: checkCodingQuestion, };
var method8 = { name: 'abv_education', fn: abv_education, };
var method9 = { name: 'abv_plans', fn: abv_plans, };

var methods = [ method1, method2, method3, method4, method5, method6, method7, method8, method9 ];

/* more complex functions --> run after other parts of sheet have updated */

// returns data from CodeWars API (honor, kyu in JS, number of kata authored)
function getCodewarsData (user) {
  var url = "https://www.codewars.com/api/v1/users/" + user;
  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  var userData = JSON.parse(response);
  if (!userData) return ["✘", "✘", 0];
  var honor = userData.honor;
  try {
    var kyu = (userData.ranks.languages.javascript.name || "✘");
    var kataAuthored = userData.codeChallenges.totalAuthored;
  }
  catch (err) {
    Logger.log(err);
  }
  return [honor || "✘", kyu || "✘", kataAuthored || 0];
}


/* functions used to update sheet --> called in final function */

function getQuestions(sheet) {
  // first 3 columns from sheet containing questions, returns valid questions
  return sheet.getRange(1, 1, sheet.getLastRow(), 3).getValues().map(function(row) {
    return {
      title: row[0],
      formQuestion: row[1],
      fn: row[2],
    };
  }).filter(function(question) { return question.title });
}

function applyHeaders(data, target) {
  var titles = data.map(function(question) { return question.title; });
  var targetRange = target.getRange(1, 1, 1, data.length);
  targetRange.setValues([ titles, ]);
  targetRange.setBackgroundColor("#4286f4")
  .setFontWeight("bold")
  .setWrap(true);

}

function getFunction(name) {
  var method = methods.filter(function(method) {
    return method.name === name;
  });
  if (!method.length) { return function(x) { return x; } }
  var fn = method[0].fn;
  if (!fn) { return function(x) { return x; } }
  return fn;
}

function getApplicantResponses(question, applicantData) {
  if (!question.formQuestion) return [];
  var questionIndex = applicantData[0].indexOf(question.formQuestion);
  if (questionIndex < 0) return [];
  return answers = applicantData.slice(1).map(function(applicant) { return applicant[questionIndex]; });
};

function insertAnswers(data, index, target) {
  if (!data.length) return;
  var targetRange = target.getRange(2, index, data.length);
  targetRange.setValues(data.map(function(element) { return [ element, ]; }));
};


// fills out data from codewars API
function insertCodewarsData(sheet, questions) {
  var data = sheet.getRange(1, 1, sheet.getLastRow(), questions.length).getValues();
  var headers = data[0];
  var nameIndex = headers.indexOf('codewars name');
  if (nameIndex < 0) return;

  var q1Index = headers.indexOf('codewars honour');
  var q2Index = headers.indexOf('codewars kyu');
  var q3Index = headers.indexOf('codewars kata authored');

  data.slice(1).forEach(function(applicant, index) {
    var username = applicant[nameIndex];
    var codewarsData = getCodewarsData(username);
    sheet.getRange(index + 2, q1Index + 1).setValue(codewarsData[0]);
    sheet.getRange(index + 2, q2Index + 1).setValue(codewarsData[1]);
    sheet.getRange(index + 2, q3Index + 1).setValue(codewarsData[2]);
  });
};

// fills out 'meets criteria' column
function evaluateCriteria(sheet, questions) {
  var data = sheet.getRange(1, 1, sheet.getLastRow(), questions.length).getValues();
  var headers = data[0];
  var colIndex = headers.indexOf('meets criteria');
  if (colIndex < 0) return;

  var kyuIndex = headers.indexOf('codewars kyu');
  var websiteIndex = headers.indexOf('github repo');
  var videoIndex = headers.indexOf('video link');
  var gitIndex = headers.indexOf('github handle');


  data.slice(1).forEach(function(applicant, index) {
    var isEligible = checkCodewars(applicant[kyuIndex])
    && noError(applicant[websiteIndex])
    && noError(applicant[videoIndex])
    && noError(applicant[gitIndex]);

    var cell = sheet.getRange(index + 2, colIndex + 1);
    cell.setValue(bool(isEligible));
    cell.setFontColor(isEligible ? "#5add5d" : "#dd5a9b");
  });
}

function updateForeignSS(spreadsheetId, sourceSheet, outputSheet) {

  var ss = SpreadsheetApp.openById(spreadsheetId);
  var source = ss.getSheetByName(sourceSheet);
  var output = ss.getSheetByName(outputSheet);
  var qu = ss.getSheetByName("questions");

  output.clearContents();
  output.setFrozenRows(1);

  // get questions from qu sheet
  var questions = getQuestions(qu);

  // source data
  var sourceData = source.getRange(1, 1, source.getLastRow(), source.getLastColumn()).getValues();

  // apply headers
  applyHeaders(questions, output);

  // for each question >>
  questions.forEach(function(question, index) {

    // get result from source data
    var applicantResponses = getApplicantResponses(question, sourceData);

    if (question.fn) {
      var fn = getFunction(question.fn);
      applicantResponses = applicantResponses.map(fn);
    }

    insertAnswers(applicantResponses, index + 1, output);
  });

  insertCodewarsData(output, questions);
  evaluateCriteria(output, questions);

  var sheetBody = output.getRange(2, 1, output.getLastRow(), output.getLastColumn());

  sheetBody.setHorizontalAlignment("center");

  sheetBody.getValues().forEach(function(row, index) {
    if (index % 2) return;
    var sheetRow = output.getRange(index + 2, 1, 1, output.getLastColumn());
    sheetRow.setBackground("#d4e2f7");
  });

  return true;

};
