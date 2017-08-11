const colorable = require('colorable');
const fs = require('fs');
const colors = {
  black: '#000',
  white: '#fff',
  baltic: '#3e3e3e'
};
const options = {
  compact: true
};
const outputFile = fs.createWriteStream('colorable-results.json');
outputFile.on('error', (err) => {
  console.log(err);
});
outputFile.write(JSON.stringify(colorable(colors, options), null, 2));
