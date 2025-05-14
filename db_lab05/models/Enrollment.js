const { sequelize, DataTypes } = require('../orm');

const Enrollment = sequelize.define('Enrollment', {
    Student_ID: {
        type: DataTypes.STRING(9),
        primaryKey: true
    },
    Course_ID: {
        type: DataTypes.STRING(8),
        primaryKey: true
    },
    Semester: {
        type: DataTypes.STRING(6),
        primaryKey: true
    },
    Grade: DataTypes.INTEGER,
    Status: {
        type: DataTypes.STRING(20),
        defaultValue: '正常'
    }
}, {
    tableName: 'ENROLLMENT',
    timestamps: false
});

module.exports = Enrollment;
