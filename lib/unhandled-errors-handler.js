'use strict';

const { logger } = require('@hubiinetwork/logger');
const NestedError = require('./nested-error');

async function handleUnhandledError (err) {
    logger.warn(err.message);
    logger.warn(NestedError.asStringified(err));
    await new Promise(resolve => setTimeout(resolve, 1000)); // Allow time to flush
    process.exit(1);
}

let _isInitialized = false;

function initUnhandledErrorsHandler () {
    // Prevent multiple instances of this handler
    if (_isInitialized)
        throw new Error('initUnhandledErrorsHandler(): Illegal attempt to initialize multiple times');

    _isInitialized = true;

    process
        .on('unhandledRejection', reason => {
            logger.warn('Failure: Unhandled rejection detected!');

            if (reason instanceof Error)
                handleUnhandledError(reason);
            else if (reason)
                handleUnhandledError(new Error(reason));
            else
                handleUnhandledError(new Error('Rejection does not come with a reason'));
        })
        .on('uncaughtException', err => {
            logger.warn('Failure: Uncaught exception detected!');

            handleUnhandledError(err);
        });
}

module.exports = {
    initUnhandledErrorsHandler
};
