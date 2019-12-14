'use strict';

var fs = require('fs');
var content = fs.readFileSync("blogs.json");
var jsonContent = JSON.parse(content);
jsonContent[jsonContent[0].key + 1] = {
  url:'https://onezero.medium.com/how-to-hack-a-voting-machine-db412f3c8ade'
};
jsonContent[0].key = jsonContent[0].key + 1;
let data = JSON.stringify(jsonContent, null, 2);
fs.writeFileSync('blogs.json', data);
console.log(jsonContent)