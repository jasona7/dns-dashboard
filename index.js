const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

function simulateDnsQuery() {
    const domains = ['google.com', 'facebook.com', 'twitter.com', 'example.com'];
    const types = ['A', 'AAAA', 'CNAME', 'MX'];
    return {
        domain: domains[Math.floor(Math.random() * domains.length)],
        type: types[Math.floor(Math.random() * types.length)],
        timestamp: new Date().toISOString(),
        resolvedIP: '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255)
    };
}

io.on('connection', (socket) => {
    console.log('New client connected');

    const intervalId = setInterval(() => {
        const simulatedData = simulateDnsQuery();
        socket.emit('dnsData', simulatedData);
    }, 2000);  // Send data every 2 seconds

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        clearInterval(intervalId);
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


server.listen(3000, () => {
    console.log('Server running on http://localhost:3000/');
});
