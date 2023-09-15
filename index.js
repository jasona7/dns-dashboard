const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const pcap = require('pcap');
const dnsPacket = require('dns-packet');  // Import dns-packet library

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const pcapSession = pcap.createSession('eth0', 'udp port 53 and udp[10:2] & 0x8000 = 0'); // DNS query filter

pcapSession.on('packet', (rawPacket) => {
    const packet = pcap.decode.packet(rawPacket);

    // Check if the packet is Ethernet > IPv4 > UDP
    if (
        packet.payload &&
        packet.payload.ethertype === 2048 &&
        packet.payload.payload &&
        packet.payload.payload.protocol === 17
    ) {
        const udpPayload = packet.payload.payload.payload;
        if (udpPayload && udpPayload.data) {
            try {
                const dnsDataDecoded = dnsPacket.decode(udpPayload.data);
                const dnsData = {
                    transactionID: dnsDataDecoded.id,
                    flags: dnsDataDecoded.flags,
                    questions: dnsDataDecoded.questions,
                    domain: dnsDataDecoded.questions.length ? dnsDataDecoded.questions[0].name : 'N/A',
                    type: dnsDataDecoded.questions.length ? dnsDataDecoded.questions[0].type : 'N/A',
                    timestamp: new Date().toISOString(),
                    resolvedIP: 'N/A'  // You'll need to handle this in responses
                };

                console.log("Emitting DNS data:", dnsData);
                io.emit('dnsData', dnsData);
            } catch (err) {
                console.error("Failed to decode DNS packet:", err);
                console.error("Raw UDP payload data:", udpPayload.data);
            }
        } else {
            console.error("UDP payload data is undefined. Skipping packet.");
        }
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000/');
});
