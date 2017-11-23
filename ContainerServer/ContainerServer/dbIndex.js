'use strict';

var Sequelize = require('sequelize');
var sequelize = new Sequelize('containerSystemDB', null, null, {
    dialect: "sqlite",
    storage: './../../DBScripts/containerSystem.db'
});