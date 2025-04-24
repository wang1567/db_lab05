
const pool = require('./db');

class StudentCRUD {
    // 檢查學號是否存在
    async checkStudentExists(studentId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query('SELECT 1 FROM STUDENT WHERE Student_ID = ?', [studentId]);
            return rows.length > 0;
        } catch (err) {
            console.error('檢查學號時出錯:', err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    // 新增學生
    async createStudent(student) {
        let conn;
        try {
            conn = await pool.getConnection();

            // 檢查學號是否已存在
            const exists = await this.checkStudentExists(student.Student_ID);
            if (exists) {
                throw new Error('學號已存在');
            }

            // 檢查學號格式 (假設學號格式為 S 開頭後接8位數字)
            if (!/^S\d{8}$/.test(student.Student_ID)) {
                throw new Error('學號格式不正確，應為 S 開頭後接8位數字');
            }

            const sql = `
        INSERT INTO STUDENT 
        (Student_ID, Name, Gender, Email, Department_ID) 
        VALUES (?, ?, ?, ?, ?)
      `;
            const result = await conn.query(sql, [
                student.Student_ID,
                student.Name,
                student.Gender,
                student.Email,
                student.Department_ID
            ]);

            console.log('新增學生成功:', result);
            return result;
        } catch (err) {
            console.error('新增學生失敗:', err.message);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    // 查詢學生
    async getStudent(studentId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query('SELECT * FROM STUDENT WHERE Student_ID = ?', [studentId]);

            if (rows.length === 0) {
                throw new Error('找不到該學號的學生');
            }

            return rows[0];
        } catch (err) {
            console.error('查詢學生失敗:', err.message);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    // 查詢所有學生
    async getAllStudents() {
        let conn;
        try {
            conn = await pool.getConnection();
            return await conn.query('SELECT * FROM STUDENT');
        } catch (err) {
            console.error('查詢所有學生失敗:', err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    // 更新學生資料
    async updateStudent(studentId, updateData) {
        let conn;
        try {
            conn = await pool.getConnection();

            // 檢查學生是否存在
            const exists = await this.checkStudentExists(studentId);
            if (!exists) {
                throw new Error('學號不存在，無法更新');
            }

            // 構建更新語句
            const fields = [];
            const values = [];

            for (const [key, value] of Object.entries(updateData)) {
                fields.push(`${key} = ?`);
                values.push(value);
            }

            if (fields.length === 0) {
                throw new Error('沒有提供更新資料');
            }

            values.push(studentId); // 最後一個參數是 WHERE 條件

            const sql = `UPDATE STUDENT SET ${fields.join(', ')} WHERE Student_ID = ?`;
            const result = await conn.query(sql, values);

            console.log('更新學生成功:', result);
            return result;
        } catch (err) {
            console.error('更新學生失敗:', err.message);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    // 刪除學生
    async deleteStudent(studentId) {
        let conn;
        try {
            conn = await pool.getConnection();

            // 檢查學生是否存在
            const exists = await this.checkStudentExists(studentId);
            if (!exists) {
                throw new Error('學號不存在，無法刪除');
            }

            const result = await conn.query('DELETE FROM STUDENT WHERE Student_ID = ?', [studentId]);

            if (result.affectedRows === 0) {
                throw new Error('刪除失敗，可能學號不存在');
            }

            console.log('刪除學生成功');
            return result;
        } catch (err) {
            console.error('刪除學生失敗:', err.message);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }
}

// 測試範例
async function testCRUD() {
    const studentCRUD = new StudentCRUD();

    try {
        // 測試新增
        console.log('=== 測試新增學生 ===');
        await studentCRUD.createStudent({
            Student_ID: 'S10810001',
            Name: '王曉明',
            Gender: 'M',
            Email: 'wang@example.com',
            Department_ID: 'CS001'
        });

        // 測試查詢
        console.log('\n=== 測試查詢學生 ===');
        const student = await studentCRUD.getStudent('S10810001');
        console.log('查詢結果:', student);

        // 測試更新
        console.log('\n=== 測試更新學生 ===');
        await studentCRUD.updateStudent('S10810001', {
            Name: '王小明',
            Email: 'xiaoming@example.com'
        });
        const updatedStudent = await studentCRUD.getStudent('S10810001');
        console.log('更新後結果:', updatedStudent);

        // 測試查詢所有學生
        console.log('\n=== 測試查詢所有學生 ===');
        const allStudents = await studentCRUD.getAllStudents();
        console.log('所有學生:', allStudents);

        // 測試刪除
        console.log('\n=== 測試刪除學生 ===');
        await studentCRUD.deleteStudent('S10810001');
        console.log('刪除成功');

        // 驗證刪除
        try {
            await studentCRUD.getStudent('S10810001');
        } catch (err) {
            console.log('驗證刪除成功:', err.message);
        }

        // 測試錯誤案例 - 學號已存在
        console.log('\n=== 測試錯誤案例 - 重複學號 ===');
        try {
            await studentCRUD.createStudent({
                Student_ID: 'S10810001',
                Name: '測試學生',
                Gender: 'F',
                Email: 'test@example.com',
                Department_ID: 'CS001'
            });
            await studentCRUD.createStudent({
                Student_ID: 'S10810001',
                Name: '測試學生',
                Gender: 'F',
                Email: 'test@example.com',
                Department_ID: 'CS001'
            });
        } catch (err) {
            console.log('正確捕獲錯誤:', err.message);
        }

        // 測試錯誤案例 - 學號格式錯誤
        console.log('\n=== 測試錯誤案例 - 學號格式錯誤 ===');
        try {
            await studentCRUD.createStudent({
                Student_ID: 'ABC123',
                Name: '格式錯誤',
                Gender: 'F',
                Email: 'format@example.com',
                Department_ID: 'CS001'
            });
        } catch (err) {
            console.log('正確捕獲錯誤:', err.message);
        }

    } catch (err) {
        console.error('測試過程中發生錯誤:', err);
    }
}

testCRUD();