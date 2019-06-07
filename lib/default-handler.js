'use strict';

const HttpError = require('./http-error');

module.exports = function defaultHandler(req, res, next) {
    next(new HttpError(404, 'Requested resource was not found!'));
};
