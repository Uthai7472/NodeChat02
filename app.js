require('dotenv').config();
const express = require('express');
const  app = express();
const socketio = require('socket.io');
const mysql = require('mysql2/promise');

// Setup a MySQL connection pool to handle database connections
const pool = mysql.createPool({
    host: process.env.MYSQL_HOSTNAME,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
});

app.set("view engine", "ejs");
app.use(express.static('public'));

const server = app.listen(process.env.PORT || 4000, () => {
    console.log("Server is running");
});

const io = socketio(server);

io.on('connect', socket => {
    console.log('A user connected: ' + socket.id);

    socket.on('chat:message', async (msg) => {
        const connection = await pool.getConnection();
        await connection.query(`INSERT INTO tb_chat (username, message) VALUES ("${msg.username}", "${msg.message}")`);
        connection.release();

        console.log('msg received : ' + JSON.stringify(msg));
        socket.user = msg.username;

        // Fetch the updated data from database
        const [rows] = await connection.query('SELECT * FROM tb_chat');
        connection.release();

        // io.emit('chat:message', msg);
        io.emit('chat:message', rows, msg);
    });

    socket.on('confirm_read', () => {
        socket.broadcast.emit('confirm_read', { username: socket.user});
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected: ' + socket.id);
    });
});

app.get('/', async (req, res) => {
    // const connection = await pool.getConnection();
    // const [rows] = await connection.query('SELECT * FROM tb_chat');
    // connection.release();

    // await res.render('index', { rows: rows });
    res.render('index');
});
// app.get('/')

// app.get('/sql_data', async (req, res) => {
//     try {
//         const connection = await pool.getConnection();
//         await connection.query('CREATE TABLE IF NOT EXISTS tb_chat (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), message VARCHAR(1000), timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
//         // await connection.query('DROP TABLE tb_chat');
//         await connection.query('INSERT INTO tb_chat (username, message) VALUES ("Ou", "Hello")');

//         const [rows] = await connection.query('SELECT * FROM tb_chat');
//         connection.release();

//         res.render('sql_data', { datas: rows });
//     }
//     catch (error) {
//         console.error('Error: ', error);
//         res.status(500).send('Internal Server Error');
//     }
// });



