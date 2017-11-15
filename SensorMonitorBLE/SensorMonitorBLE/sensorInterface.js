var globals = require('./globals');

var sensor = require('node-dht-sensor');
sensorData = null;
_readSensorData();
setInterval(_readSensorData, globals.internalSensorDataRefreshInterval);

exports.getEnvSensorData = function () {
   return sensorData;
}

function _readSensorData() {
   console.log("Reading sensor data...");

   sensor.read(22, 4, function (err, temperature, humidity) {
      if (err) {
         console.log("Error occurred while reading sensor data.");
         sensorData = null;
      }
      else {
         console.log("Sensor data read: temperature: " + temperature + ", Humidity: " + humidity + " %.");
         sensorData = { temperature: temperature, humidity: humidity };
      }
   });
}

