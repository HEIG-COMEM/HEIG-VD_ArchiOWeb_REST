import express from 'express';
import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';

const router = express.Router();

const DisableTryItOutPlugin = function () {
    return {
        statePlugins: {
            spec: {
                wrapSelectors: {
                    allowTryItOutFor: () => () => false,
                },
            },
        },
    };
};

const options = {
    swaggerOptions: {
        plugins: [DisableTryItOutPlugin],
    },
};

// Parse the OpenAPI document.
const openApiDocument = yaml.load(fs.readFileSync('./openapi.json'));
// Serve the Swagger UI documentation.
router.use('/', swaggerUi.serve, swaggerUi.setup(openApiDocument, options));

export default router;
