'use strict';

console.log('Hello world');

var bleAdvertiser = require('./bleAdvertiser');
var globals = require('./globals');

bleAdvertiser.advertiseCode(globals.okStatusCode);

function test (code) {
   bleAdvertiser.advertiseCode(code);
};

setTimeout(test, 40000, globals.lowerThresholdExceededStatusCode);
setTimeout(test, 80000, globals.okStatusCode);
setTimeout(test, 120000, globals.upperThresholdExceededStatusCode);
