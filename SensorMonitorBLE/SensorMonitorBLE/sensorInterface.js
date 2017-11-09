setInterval(readSensorData, 3000);

sensorData = { temperature: null, humidity: null };

var sensor = require('node-dht-sensor');

exports.getEnvSensorData = function () {
   return sensorData;
}

function readSensorData() {
   console.log("Reading sensor data...");

   sensor.read(22, 4, function (err, temperature, humidity) {
      if (err !== null) {
         console.log("Error occurred while reading sensor data.");
      }
      else {
         console.log("Sensor data read: temperature: " + temperature + ", Humidity: " + humidity + " %.");
      }
      sensorData = { temperature: temperature, humidity: humidity };
   });
}

