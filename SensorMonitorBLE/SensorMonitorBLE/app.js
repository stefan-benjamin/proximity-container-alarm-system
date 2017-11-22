'use strict';

var bleAdvertiser = require('./bleAdvertiser');
var globals = require('./globals');
var sensorInterface = require('./sensorInterface');
var restClient = require('./restClient');

_refreshStatus(); //first call
setInterval(_refreshStatus, globals.statusRefreshInterval); //repetitive call

function _refreshStatus()
{
   var sensorData = sensorInterface.getEnvSensorData();
   var statusCode;

   if (!sensorData) //error in sensor data
   {
      statusCode = globals.sensorErrorStatusCode;
   }
   else if (sensorData.temperature > 25)
   {
      statusCode = globals.upperThresholdExceededStatusCode;
   }
   else if (sensorData.temperature < 23)
   {
      statusCode = globals.lowerThresholdExceededStatusCode;
   }
   else
   {
      statusCode = globals.okStatusCode;
   }

   bleAdvertiser.advertiseCode(statusCode);

   //report sensor status to the server
   restClient.reportStatus(globals.serverIpAddress, globals.serverPortNumber, sensorData, statusCode, function (callbackData) {
      console.log("Successfully reported sensor status to " + callbackData.requestedIpAddress + ":" + callbackData.requestedPort);

   }, function (errorCallbackData) {
      console.log("Error while reporting sensor status to " + errorCallbackData.requestedIpAddress + ":" + errorCallbackData.requestedPort);
   })
}