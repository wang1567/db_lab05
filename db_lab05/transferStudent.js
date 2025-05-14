const pool = require('./db'); // 確保你的資料庫連接池設定檔案正確

async function transferStudent(studentId, oldDeptId, newDeptId) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction(); // 開始交易

        // 1. 更新學生所屬系所
        console.log(`開始處理學生 ${studentId} 從 ${oldDeptId} 轉到 ${newDeptId}...`);
        await conn.query(
            'UPDATE STUDENT SET Department_ID = ? WHERE Student_ID = ?',
            [newDeptId, studentId]
        );
        console.log(`學生 ${studentId} 的系所已更新為 ${newDeptId}。`);


        // 2. 標記舊系所必修課程為「轉系退選」
        // 使用 Course_Type = '必修' 根據 COURSE 表格結構
        console.log(`標記舊系所 (${oldDeptId}) 必修課程為「轉系退選」...`);
        await conn.query(`
            UPDATE ENROLLMENT
            SET Status = '轉系退選'
            WHERE Student_ID = ?
              AND Course_ID IN (
                SELECT Course_ID FROM COURSE
                WHERE Department_ID = ? AND Course_Type = '必修'
              )
        `, [studentId, oldDeptId]);
        console.log('舊系所必修課程標記完成。');


        // 3. 加選新系所必修課程
        // 使用 Course_Type = '必修' 根據 COURSE 表格結構
        console.log(`查詢新系所 (${newDeptId}) 的必修課程...`);
        const requiredCourses = await conn.query(`
            SELECT Course_ID
            FROM COURSE
            WHERE Department_ID = ? AND Course_Type = '必修'
        `, [newDeptId]);

        console.log(`找到 ${requiredCourses.length} 門新系所必修課程。`);

        // 假設有個當前學期的 ID
        const currentSemester = '112-2'; // 這個值會被插入到 ENROLLMENT 的 Semester_ID 欄位

        // 獲取當前日期，用於 Enrollment_Date 欄位 (格式 YYYY-MM-DD)
        const today = new Date();
        const enrollmentDate = today.toISOString().slice(0, 10); // 例如: "2023-10-27"

        console.log(`開始加選新系所必修課程 (學期: ${currentSemester}, 日期: ${enrollmentDate})...`);
        for (const course of requiredCourses) {
            // 檢查該學生是否已經修過或正在修這門課，避免重複加選或狀態衝突
            const existingEnrollment = await conn.query(
                'SELECT Status FROM ENROLLMENT WHERE Student_ID = ? AND Course_ID = ?',
                [studentId, course.Course_ID]
            );

            // 如果學生沒有選過這門課，才執行加選
            if (existingEnrollment.length === 0) {
                // 在 INSERT 語句中加入 Enrollment_Date 欄位，並在 VALUES 中提供對應的值
                await conn.query(`
                     INSERT INTO ENROLLMENT (Student_ID, Course_ID, Semester_ID, Enrollment_Date, Status)
                     VALUES (?, ?, ?, ?, '轉系加選')
                 `, [studentId, course.Course_ID, currentSemester, enrollmentDate]); // <--- 加入 enrollmentDate 參數
                console.log(`已為學生 ${studentId} 加選課程 ${course.Course_ID} (轉系加選)。`);
            } else {
                // 如果學生已經有選課記錄（例如：之前是選修、已修過等），可以選擇忽略或根據業務邏輯更新狀態
                console.log(`學生 ${studentId} 已有課程 ${course.Course_ID} 的選課記錄 (狀態: ${existingEnrollment[0].Status})，跳過轉系加選。`);
                // 這裡可以根據需要添加更多邏輯，例如檢查舊狀態是否應該被覆蓋或更新
            }
        }
        console.log('新系所必修課程加選處理完成。');


        await conn.commit(); // 提交交易
        console.log(`\n==== 轉系處理成功 ====`);
        console.log(`學生 ${studentId} 已從 ${oldDeptId} 成功轉到 ${newDeptId}。`);
        console.log(`====================\n`);

    } catch (err) {
        if (conn) await conn.rollback(); // 發生錯誤時回滾交易
        console.error('\n==== 轉系處理失敗 ====');
        console.error('詳細錯誤訊息：', err);
        console.error('====================\n');

    } finally {
        if (conn) conn.release(); // 釋放連接回連接池
    }
}

// 執行轉系功能（範例：學生S10810005從CS001轉到EE001）
transferStudent('S10811005', 'CS001', 'EE001');