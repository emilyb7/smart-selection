# About this app

This app was made for the Founders & Coders selection panel.

Built on top of Google Apps Script, it allows the user to specify a spreadsheet they have access to, set some basic options, and to make a new version of the sheet that's more readable.

It is tailored specifically to the responses received from the Founders & Coders application form.


## Setting up

Setting up is a bit complicated. If anyone from FAC wants to work on this and is struggling, please contact me directly :)

You'll need to install [this NPM module](https://www.npmjs.com/package/node-google-apps-script) globally:
`npm i node-google-apps-script -g`

Clone this repo

And create a file in the root directory called `gapps.config.json` (see the NPM docs for details of what needs to be in it)

You'll need a new Google Apps Script project, or access to an existing one.

If you're from Founders & Coders, ask me for access to the correct files!

And you'll also need to create a `config.json` file with the following format:

```json
{
  "source": "{_URL_SPREADSHEET_}"
}
```

This should contain the url of a spreadsheet containing a sheet called 'questions'. The current version is based on a spreadsheet found in the Founders & Coders shared repo. Ask me for details.

Server-side code is found in `./scripts`. Client side code is in `./templates`.

Both sets of code need to be compiled.

To compile the project and push up to your Google project, run `npm run update`


## Tech stack

Various Google APIs, node, npm, pug, lots of client-side JavaScript (no frameworks!), tachyons

## Docs

More detail about how the data is extracted can be found in `./docs`
