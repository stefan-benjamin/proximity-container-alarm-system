'use strict';

console.log('Hello world');

var bleno = require('bleno');
var SystemInfo = require('./systemInformationService');

var systemInfoService = new SystemInfo();

bleno.on('stateChange', function (state) {
   console.log("BLE state: " + state);

   if (bleno.state === "poweredOn")
   {
      console.log ( "Starting advertising..." )

      bleno.startAdvertising("01234567891234567890123456789", systemInfoService.uuid, function(error) {
         console.log("Error occured while starting advertising. " + error );
      });
   }
});

bleno.on('advertisingStart', function (error) {
   console.log('on -> advertisingStart: ' +
      (error ? 'error ' + error : 'success')
   );
   if (!error) {
      bleno.setServices([
         systemInfoService
      ]);
   }
});

