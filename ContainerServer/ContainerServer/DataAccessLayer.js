'use strict';

var Sequelize = require('sequelize');
var sequelize = new Sequelize('containerSystemDB', null, null, {
    dialect: "sqlite",
    storage: './../../DBScripts/containerSystem.db'
});

sequelize.authenticate().then(function (err) {
    console.log('Connection successful');
}, function (err) {
    console.log('Connection unsuccessful', err)
});

var Alarm = sequelize.define('ALARM',{
   Id: {type: Sequelize.INTEGER, primaryKey: true, autoincrement: true },
   Name: {type: Sequelize.STRING},
   Description: {type: Sequelize.STRING},
   Resolution: {type: Sequelize.STRING}},
{
    freezeTableName: true,
    tableName: 'ALARM',
    timestamps: false
});

var AlarmEvent = sequelize.define('ALARMEVENT', {
    Id:{type: Sequelize.INTEGER, primaryKey:true, autoincrement: true},
    AlarmId: {type: Sequelize.INTEGER},
    Timestamp: {type: Sequelize.STRING},
    DeviceId: {type:Sequelize.INTEGER}},
{
    freezeTableName: true,
    tableName: 'ALARMEVENT',
    timestamps:false

});

var AlarmEventResolution = sequelize.define('ALARMEVENTRESOLUTION', {
    Id:{type: Sequelize.INTEGER, primaryKey:true, autoincrement: true},
    AlarmEventId:{type: Sequelize.INTEGER},
    UserId:{type:Sequelize.INTEGER},
    Timestamp:{type: Sequelize.STRING}},
    {
        freezeTableName: true,
        tableName: 'ALARMEVENTRESOLUTION',
        timestamps: false
});

var Devices = sequelize.define('DEVICES', {
   Id:{type: Sequelize.INTEGER, primaryKey: true, autoincrement: true},
   Name: {type: Sequelize.STRING},
   Location: {type: Sequelize.STRING}},
    {
        freezeTableName: true,
        tableName: 'DEVICES',
        timestamps: false
});

var Users = sequelize.define('USERS', {
    Id:{type: Sequelize.INTEGER, primaryKey: true, autoincrement: true},
    Name: {type: Sequelize.STRING},
    Function: {type:Sequelize.STRING}},
    {
        freezeTableName: true,
        tableName: 'USERS',
        timestamps: false
});

var x = function getAlarms(alarm){
    console.log(alarm)
};

function GetAllAlarms(getAlarms) {
    Alarm.findAll().then(alarm => {
        getAlarms(alarm)
    })
};

function GetAlarmById(Id, getById){
    Alarm.findById(Id).then(alarm =>{
        getById(alarm)
    })
};

function SaveAlarm(alarm) {
    alarm.save().then(() => {})
};

function GetAllAlarmEvents(getAlarmEvents) {
    AlarmEvent.findAll().then(alarmEvent => {
        getAlarmEvents(alarmEvent)
    })
};

function GetAlarmEventById(id, alarmEventById) {
    AlarmEvent.findById(id).then(alarmEvent => {
        alarmEventById(alarmEvent)
    })
};

function SaveAlarmEvent(alarmEvent) {
    alarmEvent.save().then(() => {})
};

function GetAllAlarmEventResolutions(getAlarmEventResolutions) {
    AlarmEventResolution.findAll().then(alarmEventResolution => {
        getAlarmEventResolutions(alarmEventResolution)
    })
};

function GetAlarmEventResolutionById(id, alarmEventResolutionById){
    AlarmEventResolution.findById(id).then(alarmEventResolution => {
        alarmEventResolutionById(alarmEventResolution)
    })
};

function GetAllDevices(getDevices) {
    Devices.findAll().then(device => {
        getDevices(device)
    })
};

function GetDeviceById(id, deviceById) {
    Devices.findById(id).then(device => {
        deviceById(device)
    })
};

function GetAllUsers(getUsers) {
    Users.findAll().then(user => {
        getUsers(user)
    })
};

function GetUserById(id, userById) {
    Users.findById(id).then(user => {
        userById(user)
    })
};

GetAllAlarms(x);

//Create data
//var alarm = Alarm.build({
//    Name: 'Xtreme',
//    Description : 'Xtreme',
//    Resolution: 'Xtreme'
//})

//save data
//alarm.save().then(() =>{

//})