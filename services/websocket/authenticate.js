import jwt from 'jsonwebtoken';
import * as config from '../../config.js';
import { promisify } from 'util';

const secretKey = config.secretKey;
const verifyJwt = promisify(jwt.verify);

export const authenticate = async (ws, req, wsServer) => {
    try {
        const authorization = req.headers['sec-websocket-protocol'];
        if (!authorization) throw new Error('Authorization header is missing.');

        const match = authorization.match(/^Bearer, (.+)$/);
        if (!match)
            throw new Error('Authorization header is not a bearer token.');

        const token = match[1];
        const payload = await verifyJwt(token, secretKey);

        // check if the payload sub is already connected
        for (const client of wsServer.clients) {
            if (client.currentUserId === payload.sub) {
                throw new Error('User is already connected.');
            }
        }

        req.currentUserId = payload.sub;
        ws.currentUserId = payload.sub;

        // Obtain the list of permissions from the "scope" claim.
        const scope = payload.scope;
        req.currentUserPermissions = scope ? scope.split(' ') : [];
        ws.currentUserPermissions = scope ? scope.split(' ') : [];
    } catch (err) {
        throw new Error(`Authentication failed: ${err.message}`);
    }
};
