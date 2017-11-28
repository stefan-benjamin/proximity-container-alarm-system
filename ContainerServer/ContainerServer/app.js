var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var globals = require('./globals');
var dblayer = require('./DataAccessLayer');
var models = require('./models');
var alarmEventResolution = models.AlarmEventResolution;
var alarmEvent = models.AlarmEvent;

var app = express();
let WSServer = require('ws').Server;
let http = require('http');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', index);
app.use('/users', users);

app.listen(globals.portNumber);
console.log("Listening on port " + globals.portNumber);

var server = http.createServer(app);
server.listen(globals.webSocketPort);

var sensorsDataMap = new Map();
var alarmsMap = new Map();


var wss = new WSServer({
   server: server
});
wss.on("connection", function (ws) {
   console.log('WebSocket connection open...');
});

wss.broadcast = function broadcast(data) {
   wss.clients.forEach(function each(client) {
      client.send(data);
   });
};

app.get('/', function (req, res) {

   var sensorsDataArray = [];
   sensorsDataMap.forEach(function (value, key, map) {
      var sensorDataJson = { key: key, value: value };

      sensorsDataArray.push(sensorDataJson);
   });

   var alarmsArray = [];
   alarmsMap.forEach(function (value, key, map) {
      var alarmJson = { key: key, value: value };

      alarmsArray.push(alarmJson);
   });

   res.render('index', { sensorsData: sensorsDataArray, alarms: alarmsArray });
});

app.put('/api/sensorStatus', function (req, res) {
   var sensorId = req.body.sensorId;
   var sensorData = req.body.sensorData;
   var statusCode = req.body.statusCode;

   console.log("Received sensor status from: " + sensorId + " with sensor data: " + JSON.stringify(sensorData) + ", status code: " + statusCode);
   
   //add the alarm to the database if it is an issue - different from the ok status code.
   if (sensorsDataMap.has(sensorId)) {
      if (sensorsDataMap.get(sensorId).statusCode === "1000" && statusCode !== "1000") {
         var data = { sensorData: sensorData, statusCode: statusCode, resolved: false }
         alarmsMap.set(sensorId, data);
      }
   }

   var data = { sensorData: sensorData, statusCode: statusCode }
   sensorsDataMap.set(sensorId, data);
   
   //show this on screen somehow
   wss.broadcast(JSON.stringify({ sensorId: sensorId, sensorData: sensorData, statusCode: statusCode }));
   res.send();
});

app.get('/api/alarmInfo', function (req, res) {
   var statusCode = req.headers.statuscode;
   var resolution, description;
   
   if (statusCode === "1000") 
   {
      description = "Status OK.";
      resolution = "No action needed."
   }
   else if (statusCode === "2001")
   {
      description = "Lower temperature threshold exceeded. Container temperature too low.";
      resolution = "Reduce the cooling flow by using the valve on the right side of the container."
   }
   else if (statusCode === "2002")
   {
      description = "Upper temperature threshold exceeded. Container temperature too high.";
      resolution = "Increase the cooling flow by using the valve on the right side of the container."
   }
   else if (statusCode === "3001")
   {
      description = "Sensor error.";
      resolution = "Check that the sensor is mounted correctly. Additional wiring checks should be performed."
   }

   res.send({ alarmResolution: resolution, alarmDescription: description });

   //var getResolution = function(alarm){
   //     res.send({alarmResolution: alarm.Resolution, alarmDescription: alarm.Description});
   //}
   //dblayer.getAlarmById(alarmId, getResolution);
});

app.put('/api/alarmResolution', function (req, res) {
   var sensorId = req.body.sensorId;
   var technicianId = req.body.technicianId;
   var alarmEventTimestamp = req.body.alarmEventTimestamp;
   
   if (alarmsMap.has(sensorId)) {
      alarmsMap.get(sensorId).resolved = "Resolved by technician " + technicianId;
      console.log("Alarm resolved: sensorId: " + sensorId + " technicianId: " + technicianId);
   }

   //var saveAlarmEventResolution = alarmEventResolution.build({
   //   AlarmEventId: alarmId,
   //   UserId: technicianId,
   //   Timestamp: alarmEventTimestamp
   //});
   //dblayer.saveAlarmEventResolution(saveAlarmEventResolution);
   res.send();
});

//SB: Maybe we don't need this method - it is up to the server to determine
//when an alarm is present - based on the sensor status code.
app.put('/api/alarmEvent', function (req, res) {
   var alarmId = req.body.alarmId;
   var sensorId = req.body.sensorId;
   var timestamp = req.body.deviceTimestamp;

   var saveAlarmEvent = alarmEvent.build({
      AlarmId: alarmId,
      DeviceId: sensorId,
      Timestamp: timestamp
   });
   dblayer.saveAlarmEvent(saveAlarmEvent);
   res.send()
});

module.exports = app;
