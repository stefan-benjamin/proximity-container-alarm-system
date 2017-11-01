var bleno = require('bleno');
var util = require('util');

var UptimeCharacteristic = require('./upTimeCharacteristic');

function SystemInformationService() {
  bleno.PrimaryService.call(this, {
    uuid: 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb07',
    characteristics: [
       new UptimeCharacteristic()
    ]
  });
};

util.inherits(SystemInformationService, bleno.PrimaryService);
module.exports = SystemInformationService;