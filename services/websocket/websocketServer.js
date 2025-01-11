import { WebSocketServer } from 'ws';
import { authenticate } from './authenticate.js';

const wsServer = new WebSocketServer({ noServer: true });

wsServer.on('connection', async (ws, req) => {
    // Authenticate the user
    await authenticate(ws, req, wsServer).catch((error) =>
        ws.close(4001, error.message)
    );
    if (!ws.currentUserId) ws.close(4001, 'Authentication failed');

    ws.send('[Server] Authentication successful');
    console.log(`[WS] User authenticated: ${ws.currentUserId}`);

    ws.on('message', (message) => {
        console.log(
            `Received message: ${message}, from user: ${ws.currentUserId}`
        );
        // Send to all other clients
        wsServer.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(
                    JSON.stringify({
                        message: message.toString(),
                        from: ws.currentUserId,
                    })
                );
            }
        });
    });
});

/**
 * Notifies a list of users with a given message via WebSocket if they are connected.
 *
 * @param {Array<string>} userIds - An array of user IDs to notify.
 * @param {JSON} message - The message to send.
 *
 * @returns {void}
 *
 * @example
 * notifyUsers(['123', '456'], {
 *      type: 'friendRequestUpdate',
 *      data: {
 *          friendshipId: '123',
 *          status: 'accepted',
 *          user: {
 *              _id: '456',
 *              name: 'John Doe',
 *      }
 *  }
 */
export const notifyUsers = (userIds, message) => {
    wsServer.clients.forEach((client) => {
        if (
            client.readyState === WebSocket.OPEN &&
            userIds.includes(client.currentUserId)
        ) {
            client.send(JSON.stringify(message));
        }
    });
};

export default wsServer;
