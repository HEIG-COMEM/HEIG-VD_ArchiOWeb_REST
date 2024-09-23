import jwt from "jsonwebtoken";
import * as config from '../config.js';
import { promisify } from "util";
import User from "../models/user.js";

const secretKey = config.secretKey;
const verifyJwt = promisify(jwt.verify);

export const authenticate = (req, res, next) => {
    // Ensure the header is present.
    const authorization = req.get("Authorization");
    if (!authorization) {
        return res.status(401).send("Authorization header is missing");
    }
    // Check that the header has the correct format.
    const match = authorization.match(/^Bearer (.+)$/);
    if (!match) {
        return res.status(401).send("Authorization header is not a bearer token");
    }
    // Extract and verify the JWT.
    const token = match[1];
    verifyJwt(token, secretKey).then(payload => {
        req.currentUserId = payload.sub;

        // Obtain the list of permissions from the "scope" claim.
        const scope = payload.scope;
        req.currentUserPermissions = scope ? scope.split(" ") : [];

        next(); // Pass the ID of the authenticated user to the next middleware.
    }).catch(() => {
        res.status(401).send("Your token is invalid or has expired");
    });
}