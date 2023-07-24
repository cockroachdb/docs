const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

function getFileNames(dir) {
  var mdFileNames = [];

  var fileNames = fs.readdirSync('./'+dir);

  fileNames.forEach(fileName => {
    if (path.extname(fileName) == ".md") {
      if (fileName.includes("404") == false) {
        mdFileNames.push(dir+'/'+fileName);
      }
    } else if (path.extname(fileName) == '') {
      mdFileNames = mdFileNames.concat(getFileNames(dir+'/'+fileName));
    }
  });

  return mdFileNames;
}

function iterateVersions() {
  const config = yaml.parse(fs.readFileSync('./_config_cockroachdb.yml', 'utf8'));
  var fileNames = [];
  
  for (const [key, value] of Object.entries(config.versions)) {
    fileNames = fileNames.concat(getFileNames(`${value}`));
  }

  return fileNames;
}

module.exports = { iterateVersions };
