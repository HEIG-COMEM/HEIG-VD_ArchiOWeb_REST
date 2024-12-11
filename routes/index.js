import express from 'express';
import authRouter from './auth.js';
import userRouter from './user.js';
import publicationRouter from './publication.js';
import friendRouter from './friend.js';
import adminRouter from './admin.js';

import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.get(
    '/',
    (req, res, next) => res.redirect('/docs')
    /*
    #swagger.ignore = true
    */
);

// Special route for /status
router.get(
    '/status',
    (req, res) => res.status(200).json({ status: 'OK' })
    /*
    #swagger.tags = ['Status'];
    #swagger.description = 'Check the status of the API.'
    #swagger.responses[200] = {
        description: 'The API is running.',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/Status/Status'
                }
            }
        }
    }
    */
);

router.use(
    '/auth',
    authRouter
    /*
    #swagger.tags = ['Auth'];
    */
);
router.use(
    '/users',
    authenticate,
    userRouter
    /*
    #swagger.tags = ['Users'];
    #swagger.security = [{
         "bearerAuth": []
    }];
 */
);
router.use(
    '/publications',
    authenticate,
    publicationRouter
    /*
    #swagger.tags = ['Publications'];
        #swagger.security = [{
         "bearerAuth": []
    }];
    */
);
router.use(
    '/friends',
    authenticate,
    friendRouter
    /*
    #swagger.tags = ['Friends'];
        #swagger.security = [{
         "bearerAuth": []
    }];
    */
);
router.use(
    '/admin',
    authenticate,
    authorize('admin'),
    adminRouter
    /*
    #swagger.tags = ['Admin'];
    #swagger.security = [{
         "bearerAuth": []
    }];
    */
);

export default router;
