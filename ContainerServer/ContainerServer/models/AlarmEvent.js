module.exports = (sequelize, DataTypes) => {
    var AlarmEvent = sequelize.define('ALARMEVENT', {
            Id: {type: DataTypes.INTEGER, primaryKey: true, autoincrement: true},
            AlarmId: {type: DataTypes.INTEGER},
            Timestamp: {type: DataTypes.STRING},
            DeviceId: {type: DataTypes.INTEGER}
        },
        {
            freezeTableName: true,
            tableName: 'ALARMEVENT',
            timestamps: false

        });
    return AlarmEvent;
}