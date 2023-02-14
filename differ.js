/*  THIS PROGRAM takes json file1 (output of OpenAQ adapter measurements)
    and finds the nearest neighbor from json file2. it then checks if the
    parameter and unit are the same. if they are, it pushes the location
    and coordinates to the duplicates array. it also pushes the location
    and coordinates to the uniqueStations array if there is no duplicate, 
    and then tells you the counts of each.
     */

const turf = require('turf');
const fs = require('fs');

const path1 = './NL1-ALLDATA-clean.json';
const path2 = './NL2-ALLDATA.json';

// read the two files
const file1 = JSON.parse(fs.readFileSync(path1));
const file2 = JSON.parse(fs.readFileSync(path2));

/// create a 'feature collection' and add the parameter, unit, location, value to the 'properties' of each point
const file2FC = turf.featureCollection(file2.map(p => turf.point([p.coordinates.longitude, p.coordinates.latitude], {parameter: p.parameter, location: p.location, value: p.value, unit: p.unit, date: p.date})));

let duplicates = []
let uniqueStations = [];

// loop through each location in file1 and find the nearest neighbor from file2
file1.forEach(p1 => {
    const point = turf.point([p1.coordinates.longitude, p1.coordinates.latitude]);
    const nearest = turf.nearest(point, file2FC);
    const distance = turf.distance(point, nearest);
    let rounded = Math.round(distance * 10000) / 10000;
    let meters = rounded * 1000;
    meters = `${meters} meters`

    if (distance < 0.01) {
        if (p1.parameter === nearest.properties.parameter && p1.unit === nearest.properties.unit) {
            // if (p1.parameter === nearest.properties.parameter && p1.unit === nearest.properties.unit && p1.value === nearest.properties.value) { // OPTIONAL: check if the values are the same
          let matcher = `${p1.parameter} ${p1.unit}`;
          duplicates.push({
            parameterMatch: matcher,
            distanceToNearest: meters,
            original : {
                location: p1.location,
                coordinates: [p1.coordinates.latitude, p1.coordinates.longitude],
                value: p1.value,
                date: p1.date.utc,
            },
            nearest: {
                location: nearest.properties.location,
                coordinates: [nearest.geometry.coordinates[1], nearest.geometry.coordinates[0]],
                value: nearest.properties.value,
                date: nearest.properties.date.utc,
            }
          });
        }
      } else {
        uniqueStations.push(p1);
        }
    });
    console.dir(duplicates, {depth: null});
    console.log(`\nthere are ${duplicates.length} stations with possible duplicates`);
    console.log(`there are ${uniqueStations.length} stations with no duplicates`);

