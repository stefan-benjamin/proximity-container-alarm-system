'use strict';
var models = require('./models');
var Alarm = models.Alarm;
var AlarmEvent = models.AlarmEvent;
var AlarmEventResolution = models.AlarmEventResolution;
var Users = models.Users;
var Devices = models.Devices;
//var Sequelize = require('sequelize');
//var sequelize = new Sequelize('containerSystemDB', null, null, {
//    dialect: "sqlite",
//    storage: './../../DBScripts/containerSystem.db'
//});

   // module.exports = function(sequelize, DataTypes) {
/*var Alarm = sequelize.define('ALARM', {
                Id: {type: Sequelize.INTEGER, primaryKey: true, autoincrement: true},
                Name: {type: Sequelize.STRING},
                Description: {type: Sequelize.STRING},
                Resolution: {type: Sequelize.STRING}
            },
            {
                freezeTableName: true,
                tableName: 'ALARM',
                timestamps: false
            });
    //}
var AlarmEvent = sequelize.define('ALARMEVENT', {
        Id: {type: Sequelize.INTEGER, primaryKey: true, autoincrement: true},
        AlarmId: {type: Sequelize.INTEGER},
        Timestamp: {type: Sequelize.STRING},
        DeviceId: {type: Sequelize.INTEGER}
    },
    {
        freezeTableName: true,
        tableName: 'ALARMEVENT',
        timestamps: false

    });

var Users = sequelize.define('USERS', {
        Id: {type: Sequelize.INTEGER, primaryKey: true, autoincrement: true},
        Name: {type: Sequelize.STRING},
        Function: {type: Sequelize.STRING}
    },
    {
        freezeTableName: true,
        tableName: 'USERS',
        timestamps: false
    });

var AlarmEventResolution = sequelize.define('ALARMEVENTRESOLUTION', {
        Id: {type: Sequelize.INTEGER, primaryKey: true, autoincrement: true},
        AlarmEventId: {
            type: Sequelize.INTEGER,
            //references: {
            //    model: AlarmEvent,
            //    key: AlarmEvent.Id
           // }
        },
        UserId: {
            type: Sequelize.INTEGER,
            //references: {
            //    model: Users,
            //    key: Users.Id
           // }
        },
        Timestamp: {type: Sequelize.STRING}
    },

    {
        freezeTableName: true,
        tableName: 'ALARMEVENTRESOLUTION',
        timestamps: false
    });

var Devices = sequelize.define('DEVICES', {
        Id: {type: Sequelize.INTEGER, primaryKey: true, autoincrement: true},
        Name: {type: Sequelize.STRING},
        Location: {type: Sequelize.STRING}
    },
    {
        freezeTableName: true,
        tableName: 'DEVICES',
        timestamps: false
    });


AlarmEvent.belongsToMany(Users, {through: AlarmEventResolution, foreignKey: AlarmEventResolution.AlarmEventId});
Users.belongsToMany(AlarmEvent, {through: AlarmEventResolution, foreignKey: AlarmEventResolution.UserId});*/

/*var x = function getAlarms(alarm) {
    console.log(alarm)
};

var y = function alarmResolutions(alarmResolutions) {
    console.log(alarmResolutions)
};*/
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
}
};

//GetAllAlarms(x);
//GetAlarmResolutionsByUserId(1, y);




//var date = new Date();
//var timestamp = date.getDate();

//var alarmEvent = AlarmEvent.build({
//    AlarmId:1223,
//    Timestamp: timestamp,
//    DeviceId: 11
//});

//SaveAlarmEvent(alarmEvent);

//var alarmEventResolution = AlarmEventResolution.build({
//    AlarmEventId:1,
//    UserId:1,
//    Timestamp: timestamp
//})

//alarmEventResolution.save(() => {})


//var user = Users.build({
//    Name: 'Tomas',
//    Function : 'Developer'
//})

//user.save().then(() => {})
//Create data
//var alarm = Alarm.build({
//    Name: 'Xtreme',
//    Description : 'Xtreme',
//    Resolution: 'Xtreme'
//})

//save data
//alarm.save().then(() =>{

//})