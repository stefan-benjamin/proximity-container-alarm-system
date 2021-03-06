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

wss.broadcast = function broadcast(data, type) {
   wss.clients.forEach(function each(client) {
      data.type = type;
      client.send(JSON.stringify(data));
   });
};

app.get('/', function (req, res) {

   var sensorsDataArray = [];
   var jsonAlarmsArray = [];
   sensorsDataMap.forEach(function (value, key, map) {
      var sensorDataJson = { key: key, value: value };

      sensorsDataArray.push(sensorDataJson);
   });

   var alarmsArray = [];
   var getAlarmData = function (alarm) {
      currentAlarm = alarm;
   };

   var getAllActiveAlarms = function (activeAlarms) {
      alarmsArray = activeAlarms;
      var itemsProcessed = 0;

      var breakRequired = false;

      if (alarmsArray.length === 0)
      {
         res.render('index', { sensorsData: sensorsDataArray, alarms: [] });
         return;
      }

      alarmsArray.forEach(function (alarmEvent) {
         dblayer.getAlarmById(alarmEvent.AlarmId, function (alarm) {
            var sensorData = JSON.parse(alarmEvent.SensorData);
            var values = { sensorData: sensorData, statusCode: alarm.StatusCode };
            var alarmJson = { key: alarmEvent.DeviceId, value: values };
            jsonAlarmsArray.push(alarmJson);
            itemsProcessed++;
            if (itemsProcessed === alarmsArray.length) {
               res.render('index', { sensorsData: sensorsDataArray, alarms: jsonAlarmsArray });
            }
         });
      });
   };

   var getAllIds = function (IdList) {
      var actualIdList = [];

      IdList.forEach(function (value) {
         actualIdList.push(value.Id);
      });
      
      dblayer.getAllActiveAlarms(actualIdList, getAllActiveAlarms);
   };
   dblayer.getAllResolvedAlarmsIds(getAllIds);

   //alarmsMap.forEach(function (value, key, map) {
   //   var alarmJson = { key: key, value: value };

   //   alarmsArray.push(alarmJson);
   // });
   // res.render('index', { sensorsData: sensorsDataArray, alarms: jsonAlarmsArray });
});

app.put('/api/sensorStatus', function (req, res) {
   var sensorId = req.body.sensorId;
   var sensorData = req.body.sensorData;
   var statusCode = req.body.statusCode;

   console.log("Received sensor status from: " + sensorId + " with sensor data: " + JSON.stringify(sensorData) + ", status code: " + statusCode);

   var getAlarmIdAndSaveEvent = function (alarm) {

      var currentTimeStamp = new Date().toLocaleString();
      var saveAlarmEvent = alarmEvent.build({
         AlarmId: alarm.Id,
         DeviceId: sensorId,
         Timestamp: currentTimeStamp,
         SensorData: JSON.stringify(sensorData)
      });

      dblayer.saveAlarmEvent(saveAlarmEvent);
   };

   var getAllActiveAlarms = function (activeAlarms) {
      if (activeAlarms.length === 0)
      {
         dblayer.getAlarmByStatusCode(statusCode, getAlarmIdAndSaveEvent)
      }

      activeAlarms.forEach(function (value) {
         if (value.DeviceId !== sensorId) {
            dblayer.getAlarmByStatusCode(statusCode, getAlarmIdAndSaveEvent)
         }
      });
   };

   var getAllIds = function (IdList) {
      var actualIdList = [];

      IdList.forEach(function (value) {
         actualIdList.push(value.Id);
      });

      dblayer.getAllActiveAlarms(actualIdList, getAllActiveAlarms);
   };
   
   //add the alarm to the database if it is an issue - different from the ok status code.
   if (sensorsDataMap.has(sensorId)) {
      if (sensorsDataMap.get(sensorId).statusCode === "1000" && statusCode !== "1000") {
         dblayer.getAllResolvedAlarmsIds(getAllIds);
         
         var data = { sensorData: sensorData, statusCode: statusCode }
         //alarmsMap.set(sensorId, data);

         wss.broadcast({ sensorId: sensorId, data }, 'alarm');
      }
   }

   var data = { sensorData: sensorData, statusCode: statusCode };
   sensorsDataMap.set(sensorId, data);

   //show this on screen somehow
   wss.broadcast({ sensorId: sensorId, data }, 'sensor');
   res.send();
});

app.get('/api/alarmInfo', function (req, res) {
   var statusCode = req.headers.statuscode;
   var resolution, description;

   var getResolution = function (alarm) {
      res.send({ alarmResolution: alarm.Resolution, alarmDescription: alarm.Description });
   }

   if (statusCode === "1000") {
      description = "Status OK.";
      resolution = "No action needed."
   }
   else {
      dblayer.getAlarmByStatusCode(statusCode, getResolution);
      return;
   }
   res.send({ alarmResolution: resolution, alarmDescription: description });

});

app.put('/api/alarmResolution', function (req, res) {
   var sensorId = req.body.sensorId;
   var technicianId = req.body.technicianId;




   wss.broadcast({ sensorId: sensorId }, 'alarm-remove');

   // if (alarmsMap.has(sensorId)) {
   //    alarmsMap.get(sensorId).resolved = "Resolved by technician " + technicianId;
   //    console.log("Alarm resolved: sensorId: " + sensorId + " technicianId: " + technicianId);
   // }

   var currentTimestamp = new Date().toLocaleString();
   var getActiveAlarmId = function (activeAlarmId) {
      var saveAlarmEventResolution = alarmEventResolution.build({
         AlarmEventId: activeAlarmId,
         UserId: technicianId,
         Timestamp: currentTimestamp
      });
      dblayer.saveAlarmEventResolution(saveAlarmEventResolution);
   };

   dblayer.getCurrentActiveAlarmForSensor(sensorId, getActiveAlarmId);
   res.send();
});

module.exports = app;
