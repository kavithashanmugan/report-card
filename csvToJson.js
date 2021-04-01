function csvToJson(filename) {
  var fs = require("fs");
  
  return new Promise(function (resolve, reject) {
    fs.readFile(filename, "utf8", function (error, data) {
      if (error) return reject(error);
      console.log("reading " + filename);
      let lines = data.split(/(?:\r\n|\n)+/).filter(function (el) {
        return el.length != 0;
      });
      //console.log("lines",lines)

      var result = [];

      var headers = lines[0].split(",");
     
      for (var i = 1; i < lines.length; i++) {
        var obj = {};
        var currentline = lines[i].split(",");

        for (var j = 0; j < headers.length; j++) {
        //  console.log("testing",Number.isNaN(parseInt(currentline[j])))
          //console.log("val,,,",parseInt(currentline[j]))
          if (Number.isNaN(parseInt(currentline[j]))) {
            obj[headers[j]] = currentline[j];
          } else {
            obj[headers[j]] = parseInt(currentline[j]);
          }
        }

        result.push(obj);
      }
      resolve(result);
    });
  });
}

module.exports = {
  csvToJson,
};
