const fs = require('fs')
const inputPath = 'scripts/'
const index = require('./scripts/index.js')

let output = ''

index.forEach(file => {
  const data = fs.readFileSync(inputPath + file + '.js')
  output += data
})

fs.writeFileSync('./src/Code.js', output)
