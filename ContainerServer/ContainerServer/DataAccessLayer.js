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

var x = function getAlarms(alarm){
    console.log(alarm)
}

function GetAllAlarms(getAlarms) {
    Alarm.findAll().then(alarm => {
        getAlarms(alarm)
    })
};

function GetAlarmById(Id, getById){
    Alarm.findById(Id).then(alarm =>{
        getById(alarm)
    })
}

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