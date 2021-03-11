require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host:'us-cdbr-east-03.cleardb.com',
    user: 'bbf242ed37c75a',
    password: '3eab8a40',
    database: 'heroku_4c78b2757dcd9dc',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
