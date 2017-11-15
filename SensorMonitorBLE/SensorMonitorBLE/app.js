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
   if (!sensorData) //error in sensor data
   {
      bleAdvertiser.advertiseCode(globals.sensorErrorStatusCode);
      return;
   }
   
   if (sensorData.temperature > 25)
   {
      bleAdvertiser.advertiseCode(globals.upperThresholdExceededStatusCode);
   }
   else if (sensorData.temperature < 23)
   {
      bleAdvertiser.advertiseCode(globals.lowerThresholdExceededStatusCode);
   }
   else
   {
      bleAdvertiser.advertiseCode(globals.okStatusCode);
   }
}