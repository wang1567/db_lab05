// 假設這是你的 ormRelationTest.js 檔案內容

// 引入你的 Sequelize 模型和資料庫連接實例 (這取決於你的專案結構)
// 這裡假設你通過一個 index.js 或 db.js 檔案來獲取模型
const db = require('./models'); // 假設你的模型都在 ./models/index.js 中匯出為一個對象

async function testRelations() {
    try {
        // 如果你的應用程式啟動時沒有同步模型，可以在這裡暫時同步，但通常不建議在測試腳本中這麼做
        // await db.sequelize.sync();

        console.log('開始測試關聯查詢...');

        // 查詢 Student，並包含其關聯的 Department
        const student = await db.Student.findByPk('S10810001', {
            include: {
                model: db.Department // 包含 Department 模型
                // 你可以在這裡用 attributes 限制要選取的欄位
                // 例如：attributes: ['Student_ID', 'Name', 'Department_ID', [db.sequelize.col('Department.Department_Name'), 'DepartmentNameAlias']] // 複雜情況下的別名
                // 但如果 Model 定義中用了 field 映射，通常直接 include 即可訪問對應屬性
            }
        });

        if (student) {
            console.log(`找到學生: ${student.Name} (學號: ${student.Student_ID})`);
            if (student.Department) {
                // 因為 Department Model 中的 Department_Name 屬性已經通過 field 映射到資料庫的 'Name' 欄位，
                // 所以現在你可以直接通過 student.Department.Department_Name 存取系所名稱了
                console.log(`所屬系所名稱 (通過 Sequelize 屬性 Department_Name): ${student.Department.Department_Name}`);
                console.log(`所屬系所 ID: ${student.Department.Department_ID}`); // 其他 Department 欄位也可以存取
                console.log(`所屬系所位置: ${student.Department.Location}`);
                // ... 其他你可以從 Department Model 存取的屬性
            } else {
                console.log('該學生沒有關聯的系所資訊。');
            }
        } else {
            console.log('未找到學號 S10810001 的學生。');
        }

        console.log('關聯查詢測試結束。');

    } catch (error) {
        console.error('關聯查詢出錯：', error);
    } finally {
        // 在應用程式結束時關閉連接池
        // await db.sequelize.close();
    }
}

testRelations();