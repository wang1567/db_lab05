const pool = require('./db');

async function doTransaction(studentId) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction(); // 開始交易

        // 先檢查學號是否存在
        const checkStudent = 'SELECT * FROM STUDENT WHERE Student_ID = ?';
        console.log('檢查學生是否存在...');
        const [student] = await conn.query(checkStudent, [studentId]);

        if (!student || student.length === 0) {
            throw new Error('該學號不存在');
        }

        // 假設要同時將學生的系所由 CS001 換成 EE001
        const updateStudent = 'UPDATE STUDENT SET Department_ID = ? WHERE Student_ID = ?';
        await conn.query(updateStudent, ['EE001', studentId]);

        // 更新學生選課表中的狀態為轉系
        const updateCourses = 'UPDATE ENROLLMENT SET Status = ? WHERE Student_ID = ?';
        await conn.query(updateCourses, ['轉系', studentId]);


        // 如果以上操作都成功，則提交交易
        await conn.commit();
        console.log('交易成功，已提交');

        // 使用 Student_ID 查詢學生資訊
        const sql = 'SELECT * FROM STUDENT WHERE Student_ID = ?';
        const rows = await conn.query(sql, [studentId]); // 使用學生 ID 查詢

        if (Array.isArray(rows) && rows.length > 0) {
            console.log('修改後的學生資訊：', rows[0]); // 只顯示該學生的資料
        } else {
            console.log('無法獲取學生資訊');
        }
    } catch (err) {
        // 若有任何錯誤，回滾所有操作
        if (conn) await conn.rollback();
        console.error('交易失敗，已回滾：', err.message);
    } finally {
        if (conn) conn.release();
    }
}

// 呼叫 doTransaction 函數，傳入要搜尋的學生 ID
doTransaction('S10811001');
