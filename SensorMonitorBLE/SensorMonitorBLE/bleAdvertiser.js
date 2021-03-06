﻿var bleno = require('bleno');
var globals = require('./globals');

var bleno = require('bleno');

var startAdvertisingRequested = false;
var bleStarted = false;
var currentAdvertisedStatusCode = null;

var self = this;

bleno.on('stateChange', function (state) {
   console.log("BLE state: " + state);

   if (bleno.state === "poweredOn")
   {
      bleStarted = true;
      if (startAdvertisingRequested === true) {
         _startAdvertisingInternal();
      }
   }
});

exports.advertiseCode = function (statusCode) {
   if (statusCode !== currentAdvertisedStatusCode) {
      currentAdvertisedStatusCode = statusCode;

      _startAdvertisingInternal();
   }
};

_startAdvertisingInternal = function () {
   console.log("Attempting advertising start... BLE STARTED: " + bleStarted);
   if (bleStarted === false)
   {
      console.log ("WARN: Advertising is queued for when the BLE device is initialized.")
      startAdvertisingRequested = true;
      return;
   }

   console.log("Refreshing advertising...");
   var concatenatedAdvertisingName = globals.sensorId + ';' + currentAdvertisedStatusCode;

   bleno.stopAdvertising(function (error) {
      console.log("Advertising stopped.");
      if (error)
      {
         console.log("Error occurred while stopping advertising. " + error);
      }

      bleno.startAdvertising(concatenatedAdvertisingName, null, function (error) {
         console.log("Advertising started. Current name: " + concatenatedAdvertisingName);
         if (error) {
            console.log("Error occurred while starting advertising. " + error);
         }
      });
   });
};

