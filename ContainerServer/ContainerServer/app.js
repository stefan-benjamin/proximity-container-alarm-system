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
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

app.listen(globals.portNumber);
console.log("Listening on port " + globals.portNumber);

var server = http.createServer(app);
server.listen(globals.webSocketPort);

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

app.put('/api/sensorStatus', function (req, res) {
   var sensorId = req.body.sensorId;
   var sensorData = req.body.sensorData;
   var statusCode = req.body.statusCode;

   console.log("Received sensor status from: " + sensorId + " with sensor data: " + JSON.stringify (sensorData) + ", status code: " + statusCode);

   //show this on screen somehow
    wss.broadcast(JSON.stringify({sensorId:sensorId, sensorData: sensorData, statusCode: statusCode}));
   res.send();
});

app.post('/api/alarmResolution', function(req, res){
   var alarmId = req.body.alarmId;
    var getResolution = function(alarm){
         res.send({alarmResolution: alarm.Resolution, alarmDescription: alarm.Description});
    }
   dblayer.getAlarmById(alarmId, getResolution);
});

app.put('/api/resolveAlarm', function (req, res) {
   var alarmId = req.body.alarmId;
   var technicianId = req.body.technicianId;
   var alarmEventTimestamp = req.body.alarmEventTimestamp;
   console.log("Funky stuff alarmId: " + alarmId + " technicianId: " + technicianId + " with timestamp: " + alarmEventTimestamp )

   var saveAlarmEventResolution = alarmEventResolution.build({
    AlarmEventId: alarmId,
    UserId: technicianId,
    Timestamp: alarmEventTimestamp
});
   dblayer.saveAlarmEventResolution(saveAlarmEventResolution);
   res.send();
});

app.put('/api/alarmEvent', function (req, res) {
   var alarmId = req.body.alarmId;
   var sensorId = req.body.sensorId;
   var timestamp = req.body.deviceTimestamp;

   var saveAlarmEvent = alarmEvent.build({
       AlarmId: alarmId,
       DeviceId: sensorId,
       Timestamp: timestamp
   }) ;
   dblayer.saveAlarmEvent(saveAlarmEvent);
   res.send()
});

module.exports = app;
