const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '1567',
    database: 'university_db',
    connectionLimit: 5
});

module.exports = pool;