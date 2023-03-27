const fs = require('fs');

// read the file
const file = JSON.parse(fs.readFileSync('nl1.json'));

// create a set to store unique objects
const uniqueObjects = new Set();

// loop through each object in the file and add it to the set
file.forEach(obj => {
  const key = JSON.stringify(obj);
  uniqueObjects.add(key);
});

// convert the set back to an array of objects
const uniqueFile = Array.from(uniqueObjects).map(key => JSON.parse(key));

// write the unique file to a new file
fs.writeFileSync('uniqueFile-nl1.json', JSON.stringify(uniqueFile));
