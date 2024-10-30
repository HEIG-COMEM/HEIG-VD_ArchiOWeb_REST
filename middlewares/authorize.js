export const authorize = (requiredPermission) => {
    // Create an return an authorization middleware. The required permission
    // will be available in the returned function because it is a closure.
    return function authorizationMiddleware(req, res, next) {
        if (!req.currentUserPermissions) {
            // The user is not authenticated or has no permissions.
            return res
                .status(403)
                .send('You are not authorized to perform this action');
        }

        const authorized =
            req.currentUserPermissions.includes(requiredPermission);
        if (!authorized) {
            // The user is authenticated but does not have the required permission.
            return res
                .status(403)
                .send('You are not authorized to perform this action');
        }

        // The user is authorized.
        next();
    };
};
