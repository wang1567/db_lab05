const { sequelize, DataTypes } = require('../orm'); // 引入你的 Sequelize 實例和 DataTypes

const Department = sequelize.define('Department', {
    // Primary Key: Department_ID
    Department_ID: {
        type: DataTypes.STRING(5), // 確認這裡的型別和長度與資料庫一致
        primaryKey: true,
        field: 'Department_ID' // 映射到資料庫欄位 (如果名稱一致 field 可以省略，但加上更清晰)
    },
    // 系所名稱：Sequelize 屬性名 Department_Name 對應到資料庫欄位 Name
    Department_Name: { // <--- 這是你在 Sequelize 程式碼中使用的屬性名稱
        type: DataTypes.STRING(50), // 確認型別和長度與資料庫的 'Name' 欄位相符
        allowNull: false, // 確認是否為 NOT NULL
        field: 'Name' // <--- 映射到資料庫的實際欄位 'Name'
    },
    // 系所位置：根據資料庫 Schema，欄位名稱是 Location
    // 你的 Model 中原先是 Building，需要改成 Location 並映射
    Location: { // <--- 將屬性名稱改為 Location
        type: DataTypes.STRING(30), // 確認型別和長度與資料庫的 'Location' 欄位相符
        allowNull: true, // 請檢查資料庫中 Location 欄位是否允許 NULL
        field: 'Location' // <--- 映射到資料庫的實際欄位 'Location'
    },
    // Phone 欄位
    Phone: {
        type: DataTypes.STRING(30), // 確認型別和長度與資料庫的 'Phone' 欄位相符
        allowNull: true, // 請檢查資料庫中 Phone 欄位是否允許 NULL
        field: 'Phone' // 映射到資料庫的實際欄位 'Phone'
    },
    // Established_Year 欄位
    Established_Year: {
        type: DataTypes.INTEGER, // 確認型別與資料庫的 'Established_Year' 欄位相符 (例如 INTEGER 或 YEAR)
        allowNull: true, // 請檢查資料庫中 Established_Year 欄位是否允許 NULL
        field: 'Established_Year' // 映射到資料庫的實際欄位 'Established_Year'
    },
    // Chair_ID 欄位
    Chair_ID: {
        type: DataTypes.STRING(10), // 確認型別和長度與資料庫的 'Chair_ID' 欄位相符 (範例資料是 T開頭，猜測長度)
        allowNull: true, // 請檢查資料庫中 Chair_ID 欄位是否允許 NULL
        field: 'Chair_ID' // 映射到資料庫的實際欄位 'Chair_ID'
    },
    // College 欄位
    College: {
        type: DataTypes.STRING(50), // 確認型別和長度與資料庫的 'College' 欄位相符
        allowNull: true, // 請檢查資料庫中 College 欄位是否允許 NULL
        field: 'College' // 映射到資料庫的實際欄位 'College'
    },
    // 注意：根據你提供的資料庫 Schema，DEPARTMENT 表格中沒有 Budget 欄位。
    // 因此，Budget 屬性已從 Model 定義中移除，以符合資料庫結構。
    // 如果 Budget 確實存在於你的資料庫中但未列出，請將其添加回來並映射：
    // Budget: {
    //     type: DataTypes.DECIMAL(12, 2), // 根據你的資料庫設定
    //     allowNull: true, // 根據你的資料庫設定
    //     field: 'Budget' // 映射到資料庫的 Budget 欄位
    // },

    // 請再次檢查你的 DEPARTMENT 表格的完整 Schema，確保所有欄位都正確地對應在 Model 中。

}, {
    sequelize, // 傳入 sequelize 實例
    modelName: 'Department', // 模型名稱
    tableName: 'DEPARTMENT', // <--- 確保這裡設定了正確的資料庫表格名稱
    timestamps: false, // <--- 如果你的表格沒有 createdAt 和 updatedAt 欄位，請設為 false
    // underscored: false, // <--- 如果你的資料庫欄位名稱是 snake_case，請根據情況設定為 true 或 false
    // ... 其他 Model 選項 (例如 hooks, indexes 等)
});

// 通常模型的關聯會在一個單獨的 associate 方法中定義
/*
// 範例：在 models/index.js 或其他地方加載模型後調用 associate 方法
Department.associate = function(models) {
    // 範例：一個系所可以有很多學生 (假設你有 Student 模型)
    // Department.hasMany(models.Student, { foreignKey: 'Department_ID' });

    // 範例：一個系所可以提供很多課程 (假設你有 Course 模型)
    // Department.hasMany(models.Course, { foreignKey: 'Department_ID' });

    // 請在這裡定義你的 Department 模型相關的所有關聯
};
*/

module.exports = Department; // 導出定義好的 Department 模型