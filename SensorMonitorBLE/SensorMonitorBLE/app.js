'use strict';

var bleAdvertiser = require('./bleAdvertiser');
var globals = require('./globals');
var sensorInterface = require('./sensorInterface');
var restClient = require('./restClient');
var utils = require('./utils');

_refreshStatus(); //first call
setInterval(_refreshStatus, globals.statusRefreshInterval); //repetitive call

var previousSensorData = null;
var lastRestUpdate = new Date(0);

function _refreshStatus() {
   var sensorData = sensorInterface.getEnvSensorData();
   var statusCode;

   if (!sensorData) //error in sensor data
   {
      statusCode = globals.sensorErrorStatusCode;
   }
   else if (sensorData.temperature > 25) {
      statusCode = globals.upperThresholdExceededStatusCode;
   }
   else if (sensorData.temperature < 23) {
      statusCode = globals.lowerThresholdExceededStatusCode;
   }
   else {
      statusCode = globals.okStatusCode;
   }

   bleAdvertiser.advertiseCode(statusCode);

   //report sensor status to the server only if the data has changed or the last update was more than a minute ago

   console.log("******: PreviousSensorData: " + JSON.stringify(previousSensorData) + " SensorData: " + JSON.stringify(sensorData));

   var milisecondsSinceLastRestUpdate = (new Date() - lastRestUpdate);

   if (!utils.sensorDataObjectsEquals(previousSensorData, sensorData) || milisecondsSinceLastRestUpdate > globals.maximumRestReportInterval) {
      restClient.reportStatus(globals.serverIpAddress, globals.serverPortNumber, sensorData, statusCode, function (callbackData) {
         console.log("Successfully reported sensor status to " + callbackData.requestedIpAddress + ":" + callbackData.requestedPort);
         lastRestUpdate = new Date();

      }, function (errorCallbackData) {
         console.log("Error while reporting sensor status to " + errorCallbackData.requestedIpAddress + ":" + errorCallbackData.requestedPort);
         })
   }

   previousSensorData = sensorData;
}