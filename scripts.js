const fs = require('fs')
const inputPath = 'scripts/'
const index = require('./scripts/index.js')

const config = fs.readFileSync('./config.json')
const url = JSON.parse(config).source

let output = `
  var sourceSS = SpreadsheetApp.openByUrl("${url}")
  
`

index.forEach(file => {
  const data = fs.readFileSync(inputPath + file + '.js')
  output += data
})

fs.writeFileSync('./src/Code.js', output)
