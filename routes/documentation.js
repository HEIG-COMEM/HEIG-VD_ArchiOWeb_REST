import express from 'express';
import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';

const router = express.Router();

// Parse the OpenAPI document.
const openApiDocument = yaml.load(fs.readFileSync('./openapi.yml'));
// Serve the Swagger UI documentation.
router.use('/', swaggerUi.serve, swaggerUi.setup(openApiDocument));

export default router;
