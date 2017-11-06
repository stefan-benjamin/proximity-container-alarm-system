'use strict';

console.log('Hello world');

var bleAdvertiser = require('./bleAdvertiser');

var test = function (code) {
   bleAdvertiser.advertiseCode(new Date().getMinutes() + "v" + new Date().getSeconds);
};

setTimeout(test, 20000);
setTimeout(test, 40000);
setTimeout(test, 60000);
