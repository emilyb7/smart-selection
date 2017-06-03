## For users of this app

If you're a user of this application, you'll want to know what the 'questions' sheet is about.

The questions sheet allows user of the app to customise what data appears in the final version of the sheet.

You can either create your own 'questions' sheet or use the default template. The default template is based on the application form for applicants for FACG2.

### Format

The format of the sheet should be as follows:

Each row represents a column in the final spreadsheet. Each row has 3 columns. Additional columns can be used for notes and will be ignored by this script.

Col1: the column header as you would like it to appear in the final version
Col2: the question in the FAC application form from which to take the data (leave blank if no corresponding question)
Col3: an optional *method* to be applied to the results - see below

### Available methods

Methods are defined in `.scripts/methods.js`. Even without making changes to this project, you can make use of the following methods. Methods take a single string (i.e. response from the form) as an input, and return a single string.

- `gitify`: takes a candidate's GitHub handle, checks URL for HTTP response, returns either a link to their profile or an error
- `codewarsify`: takes a candidate's Codewars username, checks URL for HTTP response, returns either a link to their profile or an error
- `getFCCLink`: takes a candidate's freecodecamp username, checks URL for HTTP response, returns either a link to their profile or an error
- `checkLink`: generic link checking function: returns either a hyperlink or an error
- `yesNo`: returns a tick or a cross for simple yes/no questions
- `abv_rightToWork`: abbreviates answers to question about right to work
- `checkCodingQuestion`: checks answers to the coding question and returns a tick or cross
- `abv_education`: abbreviates answers to question about educational background
- `abv_plans`: abbreviates answers to the question about plans after FAC

### Special questions

For some questions in the sheet (notably the ones that rely on data from the Codwars API), the second column is left blank. These sections are updated only once the initial collection / copying of data has occurred.
