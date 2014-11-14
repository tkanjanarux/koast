var Zip = require('adm-zip');
var streamifier = require('streamifier');

function getZipFile(data, id, start) {
  var zipFile = new Zip();

  var prop;
  for(prop in data) {
    if(data.hasOwnProperty(prop)) {
      zipFile.addFile(start + id + prop + ".json",
          new Buffer(JSON.stringify(data[prop])));
    } 
  }

  var buf = zipFile.toBuffer();

  return {
    buffer: buf,
    stream: streamifier.createReadStream(buf)
  };
}

exports = module.exports = {
  getZipFile: getZipFile
};
