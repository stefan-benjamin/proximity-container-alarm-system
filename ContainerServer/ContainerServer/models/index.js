'use strict';

var Sequelize = require('sequelize');
var sequelize = new Sequelize('containerSystemDB', null, null, {
    dialect: "sqlite",
    storage: './../../DBScripts/containerSystem.db'
});

var models = ['Alarm', 'AlarmEvent', 'AlarmEventResolution','Devices', 'Users'];

models.forEach(function (model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});

(function (m) {
    m.AlarmEvent.belongsToMany(m.Users, {through: m.AlarmEventResolution, foreignKey: m.AlarmEventResolution.AlarmEventId});
    m.Users.belongsToMany(m.AlarmEvent, {through: m.AlarmEventResolution, foreignKey: m.AlarmEventResolution.UserId});
})(module.exports);

module.exports.sequelize = sequelize;