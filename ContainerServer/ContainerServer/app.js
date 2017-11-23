var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var globals = require('./globals');
var dblayer = require('./DataAccessLayer')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

app.listen(globals.portNumber);
console.log("Listening on port " + globals.portNumber);

app.put('/api/sensorStatus', function (req, res) {
   var sensorId = req.body.sensorId;
   var sensorData = req.body.sensorData;
   var statusCode = req.body.statusCode;

   console.log("Received sensor status from: " + sensorId + " with sensor data: " + JSON.stringify (sensorData) + ", status code: " + statusCode);
   
   res.send();
});

app.get('/api/alarmResolution', function(req, res){
   res.send('test')
});

app.put('/api/resolveAlarm', function (req, res) {
   var alarmId = req.body.alarmId;
   var technicianId = req.body.technicianId;
   var alarmEventTimestamp = req.body.alarmEventTimestamp;

   res.send();
});

app.put('/api/alarmEvent', function (req, res) {
   var alarmId = req.body.alarmId;
   var sensorId = req.body.sensorId;
   var timestamp = req.body.deviceTimestamp;

});

module.exports = app;
