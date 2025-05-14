const pool = require('./db');

async function transferStudent(studentId, oldDeptId, newDeptId) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // 1. 更新學生所屬系所
        await conn.query(
            'UPDATE STUDENT SET Department_ID = ? WHERE Student_ID = ?',
            [newDeptId, studentId]
        );

        // 2. 標記舊系所必修課程為「轉系退選」
        await conn.query(`
            UPDATE ENROLLMENT
            SET Status = '轉系退選'
            WHERE Student_ID = ?
              AND Course_ID IN (
                SELECT Course_ID FROM COURSE
                WHERE Department_ID = ? AND Course_Type = '必修' -- <--- 已修改
              )
        `, [studentId, oldDeptId]);

        // 3. 加選新系所必修課程
        const requiredCourses = await conn.query(`
            SELECT Course_ID
            FROM COURSE
            WHERE Department_ID = ? AND Course_Type = '必修' -- <--- 已修改
        `, [newDeptId]);

        // 假設有個當前學期的 ID
        // 注意：這裡假設所有轉入必修都是當前學期的課。實際情況可能需要更複雜的邏輯來確定學期。
        const currentSemester = '112-2';

        for (const course of requiredCourses) {
            // 檢查該學生是否已經修過或正在修這門課，避免重複加選或狀態衝突
            // 這是一個簡化的範例，實際應用中可能需要更嚴謹的檢查
            const existingEnrollment = await conn.query(
                'SELECT Status FROM ENROLLMENT WHERE Student_ID = ? AND Course_ID = ?',
                [studentId, course.Course_ID]
            );

            // 如果學生沒有選過這門課，才執行加選
            if (existingEnrollment.length === 0) {
                await conn.query(`
                     INSERT INTO ENROLLMENT (Student_ID, Course_ID, Semester, Status)
                     VALUES (?, ?, ?, '轉系加選')
                 `, [studentId, course.Course_ID, currentSemester]);
            } else {
                // 如果學生已經有選課記錄（例如：之前是選修、已修過等），可以選擇忽略或根據業務邏輯更新狀態
                console.log(`學生 ${studentId} 已有課程 ${course.Course_ID} 的選課記錄，跳過轉系加選。`);
                // 這裡可以根據需要添加更多邏輯，例如檢查舊狀態是否應該被覆蓋
            }
        }

        await conn.commit();
        console.log(`學生 ${studentId} 已從 ${oldDeptId} 轉到 ${newDeptId}`);
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('轉系處理失敗：', err);
    } finally {
        if (conn) conn.release();
    }
}

// 執行轉系功能（範例：學生S10810005從CS001轉到EE001）
transferStudent('S10810005', 'CS001', 'EE001');