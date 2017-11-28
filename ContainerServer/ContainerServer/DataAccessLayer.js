'use strict';
var models = require('./models');
var Alarm = models.Alarm;
var AlarmEvent = models.AlarmEvent;
var AlarmEventResolution = models.AlarmEventResolution;
var Users = models.Users;
var Devices = models.Devices;
var Index = models.index;
var sequelize = require('sequelize');

var op = sequelize.Op;

module.exports = {
 getAllAlarms:   function GetAllAlarms(getAlarms)
{
    Alarm.findAll().then(alarm => {
        getAlarms(alarm)
    })
},

 getAlarmById: function GetAlarmById(Id, getById) {
    Alarm.findById(Id).then(alarm => {
        getById(alarm)
    })
},
    saveAlarm: function SaveAlarm(alarm) {
    alarm.save().then(() => {
    })
},

getAlarmByStatusCode: function GetAlarmByStatusCode(statusCode, getByStatusCode){
  Alarm.findOne({
      where:{statusCode: statusCode}
  }).then(alarm => {
      getByStatusCode(alarm)
  })
},

getAllAlarmEvents: function GetAllAlarmEvents(getAlarmEvents) {
    AlarmEvent.findAll().then(alarmEvent => {
        getAlarmEvents(alarmEvent)
    })
},

getAlarmEventById: function GetAlarmEventById(id, alarmEventById) {
    AlarmEvent.findById(id).then(alarmEvent => {
        alarmEventById(alarmEvent)
    })
},

saveAlarmEvent: function SaveAlarmEvent(alarmEvent) {
    alarmEvent.save().then(() => {
    })
},

getAllAlarmEventResolutions: function GetAllAlarmEventResolutions(getAlarmEventResolutions) {
    AlarmEventResolution.findAll().then(alarmEventResolution => {
        getAlarmEventResolutions(alarmEventResolution)
    })
},

getAllarmEventResolutionById: function GetAlarmEventResolutionById(id, alarmEventResolutionById) {
    AlarmEventResolution.findById(id).then(alarmEventResolution => {
        alarmEventResolutionById(alarmEventResolution)
    })
},

saveAlarmEventResolution: function SaveAlarmEventResolution(alarmEventResolution) {
    alarmEventResolution.save().then(() => {
    })
},

getAllDevices: function GetAllDevices(getDevices) {
    Devices.findAll().then(device => {
        getDevices(device)
    })
},

getDeviceById: function GetDeviceById(id, deviceById) {
    Devices.findById(id).then(device => {
        deviceById(device)
    })
},

saveDevice: function SaveDevice(device) {
    device.save().then(() => {
    })
},

getAllUsers: function GetAllUsers(getUsers) {
    Users.findAll().then(user => {
        getUsers(user)
    })
},

getUserById: function GetUserById(id, userById) {
    Users.findById(id).then(user => {
        userById(user)
    })
},

saveUser: function SaveUser(user) {
    user.save().then(() => {
    })
},

getAlarmResolutionsByUserId: function GetAlarmResolutionsByUserId(id, alarmEventByUser) {
    AlarmEvent.findAll({
        include: [{
            model: Users,
            where: {Id: id}
        }]
    }).then(alarmEvent => {
        alarmEventByUser(alarmEvent)
    })
},

getCurrentActiveAlarmForSensor: function GetCurrentActiveAlarmIdForSensor(sensorId, activeAlarmId ){
  AlarmEvent.max('Id', {
      where: {
          DeviceId:sensorId
      }
  }).then(currentalarmEvent => {
      activeAlarmId(currentalarmEvent)
  })
},

getAllResolvedAlarmsIds: function GetAllResolvedAlarmsIds(alarmIds) {
    AlarmEventResolution.findAll({
        Attributes:['Id']
    }).then(resolvedIds => {
        alarmIds(resolvedIds)
    })
},

getAllActiveAlarms: function GetAllActiveAlarms(resolvedIds, activeAlarm){
  AlarmEvent.findAll({where:{
      Id:{
          [op.notIn]:resolvedIds
      }
  }
  }).then(activeAlarms =>{
      activeAlarm(activeAlarms)
  })
}
};