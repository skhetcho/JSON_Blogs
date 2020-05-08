 'use strict';

// Get last file created number
var fs = require('fs');
var blogFileCounter = fs.readFileSync("blogFileCounter.json");
var blogfileCounterKey = JSON.parse(blogFileCounter);
var key = blogfileCounterKey.key

// handle and parse last file
var content = fs.readFileSync('blogs_' + key + '.json');
var jsonContent = JSON.parse(content);

// if 10 blogs links have been created in the last file, then create a new last file
if (jsonContent[0].key >= 10){
  // create new data for the new file
  let newData = [
    {
      "key": 1
    },
    {
      "url": "https://onezero.medium.com/how-to-hack-a-voting-machine-db412f3c8ade"
    }
  ]
  
  // stringify the new data to be pushed as json
  let newFile = JSON.stringify(newData, null, 2);

  // write the new data to a new file numbered based on the previous file number (ex. blogs_1.json ... blogs_99.json)
  fs.writeFileSync('blogs_' + (key + 1) + '.json', newFile);
  
  // update the count of the number of blogs files in blogfileCounter.json
  blogfileCounterKey.key = blogfileCounterKey.key + 1
  let newKey = JSON.stringify(blogfileCounterKey, null, 2);
  fs.writeFileSync('blogFileCounter.json', newKey)
}
else {
  // add a new blog to the last file
  jsonContent[jsonContent[0].key + 1] = {
    url:'https://onezero.medium.com/how-to-hack-a-voting-machine-db412f3c8ade'
  };
  // update the count of the number of blogs in that file
  jsonContent[0].key = jsonContent[0].key + 1;
  let data = JSON.stringify(jsonContent, null, 2);
  fs.writeFileSync('blogs_' + key + '.json', data);
}