'use strict';

const errorHandler = require('./lib/error-handler');
const defaultHandler = require('./lib/default-handler');
const HttpError = require('./lib/http-error');
const NestedError = require('./lib/nested-error');
const { initUnhandledErrorsHandler } = require('./lib/unhandled-errors-handler');

module.exports = {
    errorHandler,
    defaultHandler,
    HttpError,
    NestedError,
    initUnhandledErrorsHandler
};
