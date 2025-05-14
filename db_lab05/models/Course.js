const { sequelize, DataTypes } = require('../orm'); // 引入你的 Sequelize 實例和 DataTypes

const Course = sequelize.define('Course', {
    Course_ID: {
        type: DataTypes.STRING(8), // 確認這裡的型別和長度與資料庫一致
        primaryKey: true
        // 如果資料庫欄位名稱就是 Course_ID，這裡不需要 field 映射
    },
    Title: {
        type: DataTypes.STRING(100), // 確認型別和長度
        allowNull: false
        // field: 'Title' // 如果資料庫欄位名稱是 Title
    },
    // 根據你之前提供的 COURSE 表格結構，還有 Description, Level, Hours_Per_Week 欄位。
    // 確保這些欄位也包含在你的 Model 定義中，並根據需要添加 field 映射。
    Description: {
        type: DataTypes.STRING(255), // 請根據你的資料庫欄位實際長度設定
        // field: 'Description' // 如果資料庫欄位名稱是 Description
    },
    Credits: { // 你原先有這個
        type: DataTypes.INTEGER, // 確認型別
        allowNull: false
        // field: 'Credits' // 如果資料庫欄位名稱是 Credits
    },
    Level: {
        type: DataTypes.STRING(20), // 請根據你的資料庫欄位實際型別和長度設定
        // field: 'Level' // 如果資料庫欄位名稱是 Level
    },
    Hours_Per_Week: {
        type: DataTypes.INTEGER, // 請根據你的資料庫欄位實際型別設定
        // field: 'Hours_Per_Week' // 如果資料庫欄位名稱是 Hours_Per_Week
    },
    Department_ID: { // 你原先有這個 (通常是外來鍵)
        type: DataTypes.STRING(5), // 確認型別和長度與 Department_ID 相符
        // field: 'Department_ID' // 如果資料庫欄位名稱是 Department_ID
    },
    // 移除 Is_Required 屬性，新增一個對應資料庫 Course_Type 欄位的屬性
    Course_Type: { // <-- 使用 'Course_Type' 作為 Sequelize 屬性名稱
        type: DataTypes.STRING(10), // <--- 型別改為 STRING，長度足夠儲存 '必修' 或 '選修'
        allowNull: true, // <-- 請根據你資料庫中 Course_Type 欄位是否允許 NULL 來設定 (之前設了 DEFAULT '選修'，通常會是 NOT NULL)
        // defaultValue: '選修', // <-- 如果你希望在 Model 層設定預設值，與資料庫的 DEFAULT '選修' 相符

        field: 'Course_Type' // <--- **** 關鍵修改 ****：對應到資料庫中實際的欄位名稱 'Course_Type'
    }

}, {
    tableName: 'COURSE', // <--- 確保這裡設定了正確的資料庫表格名稱
    timestamps: false // <--- 如果你的表格沒有 createdAt 和 updatedAt 欄位，請設為 false
    // underscored: false, // <--- 如果你的資料庫欄位名稱不是 snake_case，請根據情況設定為 false
    // ... 其他 Model 選項
});

// 通常模型的關聯會在一個單獨的 associate 方法中定義
/*
// 範例：在 models/index.js 或其他地方加載模型後調用 associate 方法
Course.associate = function(models) {
    // 範例：一門課程屬於一個系所 (假設你有 Department 模型)
    // Course.belongsTo(models.Department, { foreignKey: 'Department_ID' });

    // 範例：一門課程有很多選課記錄 (假設你有 Enrollment 模型)
    // Course.hasMany(models.Enrollment, { foreignKey: 'Course_ID' });

    // 請在這裡定義你的 Course 模型相關的所有關聯
};
*/

module.exports = Course; // 導出定義好的 Course 模型