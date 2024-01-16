const socket = io()

const form = document.getElementById('form');
const sendBtn = document.getElementById('btn_send');
const name = document.getElementById('name');
const message = document.getElementById('message');
const confirmRead = document.getElementById('btn_confirm_read');

// Initial name
name.value = getName();

function getName() {
    const date = new Date();
    return 'User-' + date.toLocaleTimeString();
}

sendBtn.addEventListener('click', e => {
    // e.preventDefault();
    if (message.value) {
        const currentDateTime = new Date();
        const payload = {
            username: name.value,
            message: message.value,
            date: currentDateTime.toLocaleDateString(),
            separate: ' | ',
            time: currentDateTime.toLocaleTimeString(),
        }
        socket.emit('chat:message', payload);

        message.value = '';
    }
});

// socket.on('chat:message', (data) => {
//     // const connection = await pool.getConnection();
//     // const [rows] = await connection.query('SELECT * FROM tb_chat');
//     // connection.release();

//     // console.log(rows);

//     const DIV = document.createElement('div');
//     DIV.classList.add('message');
//     DIV.innerHTML = `
//     <p class="meta">${data.username}<span>${data.separate}</span><span>${data.date}</span><span>${data.time}</span></p>
//     <p class="meta">${data.message}</p>
//     `
//     // <p class="meta">${data.username}<span>${data.separate}</span><span>${data.date}</span><span>${data.time}</span></p>

//     document.querySelector('.chat-messages').appendChild(DIV);
// });

socket.on('chat:message', (data, msg) => {
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.innerHTML = ''; // Clear the existing messages

    data.forEach((row) => {
        const DIV = document.createElement('div');
        DIV.classList.add('message');
        DIV.innerHTML = `
            <p class="meta">${row.username} | ${msg.date} ${msg.time}</p>
            <p class="meta">${row.message}</p>
        `;
        chatMessages.appendChild(DIV);
    });
});

const readInfo = document.getElementById('read-info');

confirmRead.addEventListener('click', () => {
    socket.emit('confirm_read');
});

socket.on('confirm_read', data => {
    readInfo.textContent = data.username + " อ่านแล้ว";
});

// (function connect() {
//     let socket = io.connect("http://localhost:4000");
// })();