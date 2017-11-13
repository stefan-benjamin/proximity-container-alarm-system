const Sequelize = require('sequelize');
const sequelize = new Sequelize('containerSystem.db', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },

    // SQLite only
    storage: './../../DBScripts/containerSystem.db'
});