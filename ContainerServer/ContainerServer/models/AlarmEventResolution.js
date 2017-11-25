module.exports = (sequelize, DataTypes) => {
    var AlarmEventResolution = sequelize.define('ALARMEVENTRESOLUTION', {
            Id: {type: DataTypes.INTEGER, primaryKey: true, autoincrement: true},
            AlarmEventId: {
                type: DataTypes.INTEGER,
            },
            UserId: {
                type: DataTypes.INTEGER,
            },
            Timestamp: {type: DataTypes.STRING}
        },
        {
            freezeTableName: true,
            tableName: 'ALARMEVENTRESOLUTION',
            timestamps: false
        });
    return AlarmEventResolution;
}