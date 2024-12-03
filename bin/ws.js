import WSServerPubSub from '../services/websocket/WSServerPubSub.mjs';
import { WebSocketServer } from 'ws';

const wsServer = new WebSocketServer({ noServer: true });

wsServer.on('connection', (ws, req) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        // Send to all other clients
        wsServer.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(`${message}`);
            }
        });
    });

    ws.on('close', (code, reason) => {
        console.log(`Connection closed: ${code} - ${reason}`);
    });

    ws.on('error', (error) => {
        console.error(`Connection error: ${error}`);
    });

    ws.send('Connected to the server!');
});

export default wsServer;
