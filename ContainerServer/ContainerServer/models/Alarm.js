module.exports = (sequelize, DataTypes) => {
    const Alarm = sequelize.define('ALARM', {
            Id: {type: DataTypes.INTEGER, primaryKey: true, autoincrement: true},
            Name: {type: DataTypes.STRING},
            Description: {type: DataTypes.STRING},
            Resolution: {type: DataTypes.STRING}
        },
        {
            freezeTableName: true,
            tableName: 'ALARM',
            timestamps: false
        });
    return Alarm;
}