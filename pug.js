const pug = require('pug')
const fs = require('fs')

const filePath = 'templates/base.pug'

const html = pug.renderFile(filePath)

fs.writeFileSync('output.html', html)
