'use strict';

const NestedError = require('./nested-error');

let _logFn;

async function handleUnhandledError (err) {
    _logFn(err.message);
    _logFn(NestedError.asStringified(err));
    await new Promise(resolve => setTimeout(resolve, 1000)); // Allow time to flush
    process.exit(1);
}

function initUnhandledErrorsHandler (logFn) {
    // Prevent multiple instances of this handler
    if (_logFn)
        throw new Error('initUnhandledErrorsHandler(logFn): Illegal attempt to initialize multiple times');

    if (typeof logFn !== 'function')
        throw new TypeError('initUnhandledErrorsHandler(logFn): logFn argument is not a function');

    _logFn = logFn;

    process
        .on('unhandledRejection', reason => {
            _logFn('Failure: Unhandled rejection detected!');

            if (reason instanceof Error)
                handleUnhandledError(reason);
            else if (reason)
                handleUnhandledError(new Error(reason));
            else
                handleUnhandledError(new Error('Rejection does not come with a reason'));
        })
        .on('uncaughtException', err => {
            _logFn('Failure: Uncaught exception detected!');

            handleUnhandledError(err);
        });
}

module.exports = {
    initUnhandledErrorsHandler
};
