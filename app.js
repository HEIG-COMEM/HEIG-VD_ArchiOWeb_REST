import express from 'express';
import createError from 'http-errors';
import logger from 'morgan';
import mongoose from 'mongoose';

import * as config from './config.js';
mongoose.connect(config.mongoUri);

import indexRouter from './routes/index.js';
import documentationRouter from './routes/documentation.js';

const app = express();

// Log requests (except in test mode).
if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// REST API routes
app.use('/api/v1', indexRouter);

// REST API documentation
app.use('/docs', documentationRouter);

app.get('/', (req, res) => res.redirect('/docs'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// API error handler (responds with JSON)
app.use('/api', function (err, req, res, next) {
    // Log the error on stderr
    console.warn(err);

    // Respond with 422 Unprocessable Entity if it's a Mongoose validation error
    if (err.name == 'ValidationError' && !err.status) {
        err.status = 422;
    }

    // Set the response status code
    res.status(err.status || 500);

    // Send the error message in the response
    const response = {
        message: err.message,
    };

    // If it's a validation error, also send the errors details from Mongoose
    if (err.status == 422) {
        response.errors = err.errors;
    }

    // Send the error response
    res.json({ message: response });
});

// Generic error handler (responds with HTML)
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Send the error status
    res.status(err.status || 500);
    res.json({ message: err.message });
});

export default app;
