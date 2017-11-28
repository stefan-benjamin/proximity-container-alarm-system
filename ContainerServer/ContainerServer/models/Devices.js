module.exports = (sequelize, DataTypes) => {
var Devices = sequelize.define('DEVICES', {
        Id: {type: DataTypes.INTEGER, primaryKey: true, autoincrement: true},
        Name: {type: DataTypes.STRING},
        Location: {type: DataTypes.STRING},
        SensorType: {type: DataTypes.STRING},
        MeasureUnit: {type: DataTypes.STRING}
    },
    {
        freezeTableName: true,
        tableName: 'DEVICES',
        timestamps: false
    });
    return Devices;
}