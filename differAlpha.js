const fs = require('fs');
const path = require('path');

// Haversine formula to calculate the distance between two points
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Read and parse JSON file, with error handling
function readJSONFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    console.error(`Error reading or parsing ${path.basename(filePath)}: ${error.message}`);
    return null;
  }
}

// Find duplicate locations and print results
function findDuplicateLocations(file1, file2, threshold) {
  let duplicateCount = 0;

  file1.forEach(location1 => {
    file2.forEach(location2 => {
      if (location1.parameter === location2.parameter) {
        const distance = haversineDistance(
          location1.coordinates.latitude,
          location1.coordinates.longitude,
          location2.coordinates.latitude,
          location2.coordinates.longitude
        );

        if (distance <= threshold) {
          duplicateCount++;
          console.log(`Duplicate ${duplicateCount}:`);
          console.log(`- Location from ${path.basename(jsonFile1)}:`, JSON.stringify(location1, null, 2));
          console.log(`- Location from ${path.basename(jsonFile2)}:`, JSON.stringify(location2, null, 2));
          console.log(`- Distance: ${distance.toFixed(4)} km\n`);
        }
      }
    });
  });

  console.log(`Total duplicates found within ${threshold} km: ${duplicateCount}`);
}

const jsonFile1 = path.resolve(__dirname, 'data/eea-spain.json');
const jsonFile2 = path.resolve(__dirname, 'data/barca.json');
const distanceThreshold = 0.1; // Set the threshold in kilometers 0.1 is ~300ft 0.01 is ~30ft

const file1 = readJSONFile(jsonFile1);
const file2 = readJSONFile(jsonFile2);

if (file1 && file2) {
  findDuplicateLocations(file1, file2, distanceThreshold);
}
