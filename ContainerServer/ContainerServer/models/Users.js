module.exports = (sequelize, DataTypes) => {
    var Users = sequelize.define('USERS', {
            Id: {type: DataTypes.INTEGER, primaryKey: true, autoincrement: true},
            Name: {type: DataTypes.STRING},
            Function: {type: DataTypes.STRING}
        },
        {
            freezeTableName: true,
            tableName: 'USERS',
            timestamps: false
        });
    return Users;
}