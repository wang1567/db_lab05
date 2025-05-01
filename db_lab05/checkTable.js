const pool = require('./db');

async function checkTable() {
    let conn;
    try {
        conn = await pool.getConnection();

        // 查看DEPARTMENT表的结构
        const result = await conn.query('SHOW COLUMNS FROM DEPARTMENT');
        console.log('DEPARTMENT表结构：');
        console.log(result);

        // 查看DEPARTMENT表中的数据
        const data = await conn.query('SELECT * FROM DEPARTMENT LIMIT 5');
        console.log('\nDEPARTMENT表中的数据：');
        console.log(data);

    } catch (err) {
        console.error('查询失败：', err);
    } finally {
        if (conn) conn.release();
    }
}

checkTable();