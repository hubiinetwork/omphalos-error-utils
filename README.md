# Error Utils

## About

This library contains a set of common error handling related utilities.

## Installation

    npm install hubiinetwork/omphalos-error-utils

## Usage

```javascript

    const {HttpError, NestedError, defaultHandler, errorHandler} = require('@hubiinetwork/omphalos-error-utils');

```

- HttpError - Error class that has an error code
- NestedError - Error class that contains an inner exception
- defaultHandler - express middleware for generating a 404 error
- errorHandler - express middleware for transforming an error into a JSON
  response. Has support for HttpError
- unhandled-errors-handler - Handles uncaught exceptions and rejections

### Examples

**Express Error Handling for REST APIs**

The `HttpError` class extends the regular JavaScript Error class by adding
a `code` property. Use it in conjunction with express and the
`errorHandler` middleware.

```javascript

    const express = require('express');
    const {HttpError, defaultHandler, errorHandler} = require('@hubiinetwork/omphalos-error-utils');

    const app = express();

    // All requests to /failure will result in a 500 error.
    app.all('/failure', function (req, res, next) {
        next(new HttpError(500, '...is always an option'));
    });

    // Unhandled requests gets converted to a 404 HttpError
    app.use(defaultHandler);

    // Transforms reported errors to HTTP errors with JSON payload
    app.use(errorHandler);

```

**Nested Errors**

The `NesterError` class extends the regular JavaScript Error class by
adding an `innerException` property. This is typically handy when you
catch and rethrow exceptions and need to keep the original error as well
as add context as to where the exception happened. NestedErrors can
of course also be caught and rethrown in another NestedError.

```javascript

    const {NestedError} = require('@hubiinetwork/omphalos-error-utils');

    function thisThrowsError() {
        throw new Error('Something went wrong');
    }

    function thisThrowsNestedError() {
        try {
            thisThrowsError();
        }
        catch (err) {
            throw new NestedError(err, 'The function threw an error');
        }
    }

    try {
        thisThrowsNestedError();
    }
    catch (err) {
        console.log(err);
    }

```

The output will look something like this:

```
{ Error: The function threw an error
    at thisThrowsNestedError (repl:5:19)
    at repl:1:7
    at ContextifyScript.Script.runInThisContext (vm.js:50:33)
    at REPLServer.defaultEval (repl.js:240:29)
    at bound (domain.js:301:14)
    at REPLServer.runBound [as eval] (domain.js:314:12)
    at REPLServer.onLine (repl.js:468:10)
    at emitOne (events.js:121:20)
    at REPLServer.emit (events.js:211:7)
    at REPLServer.Interface._onLine (readline.js:282:10)
  innerError:
   { message: 'Something went wrong',
     stack:
      [ '    at thisThrowsError (repl:2:15)',
        '    at thisThrowsNestedError (repl:3:13)',
        '    at repl:1:7',
        '    at ContextifyScript.Script.runInThisContext (vm.js:50:33)',
        '    at REPLServer.defaultEval (repl.js:240:29)' ],
     innerError: undefined } }
```

If you prefer a prettier log message better suited for a JSON response,
you can use the `NestedError#asStringified()` method.

```javascript

    try {
        thisThrowsNestedError();
    }
    catch (err) {
        console.log(err.asStringified());
    }

```

Gives something like this:

```json
{
  "message": "The function threw an error",
  "stack": [
    "    at thisThrowsNestedError (repl:5:19)",
    "    at repl:1:7",
    "    at ContextifyScript.Script.runInThisContext (vm.js:50:33)",
    "    at REPLServer.defaultEval (repl.js:240:29)",
    "    at bound (domain.js:301:14)"
  ],
  "innerError": {
    "message": "Something went wrong",
    "stack": [
      "    at thisThrowsError (repl:2:15)",
      "    at thisThrowsNestedError (repl:3:13)",
      "    at repl:1:7",
      "    at ContextifyScript.Script.runInThisContext (vm.js:50:33)",
      "    at REPLServer.defaultEval (repl.js:240:29)"
    ]
  }
}
```
**Unhandled errors handler**

 This is an feature that does some rudimentary error handling of unhandled exceptions and rejections.

 * Unhandled errors are converted to a standard format before handling
 * Errors are expanded, logged and written to the console
 * A brief delay is inserted to allow output buffers to be flushed
 * The application is terminated by call to `process.exit()`

 It is assumed by convention that uncaught exceptions and rejections are a result of errors that are either intensionally or un-intensionally not handled because there is no known way to proceed execution in a known state. The only sane way to handle the error is to terminate the application and let Kubernetes start it again.

 This feature will terminate execution by calling `process.exit()`, but only after a brief delay to allow for log-buffers to flush. `exit()` is called to ensure that the application does not hang while waiting for some async task to respond.

 Enable this feature by calling it's initialization function. The function should not be called more than once for each application. It will throw if it is.
 The initialization function takes a logger function as input. The logger function is injected into the handler and must be able to log simple strings.

```javascript
    // Enable the unhandled errors handler while injecting logger function
    const { initUnhandledErrorsHandler } = require('@hubiinetwork/omphalos-error-utils');
    initUnhandledErrorsHandler(console.log);
```
Of course, the feature will also be enabled if any exported `omphalos-error-utils` symbols happens to be used.

**NOTE**: Unhandled exceptions that originates in some async task do not carry a stack trace with good information by itself. Please make an habit of always catching potential Errors from external (i.e. async call to a library) async tasks and rethrow the error wrapped in a `NestedError`. That ensures that the stack trace includes information of both where the error originated and the place in the application code the call was made.

See above of how `NestedError` is used.

## Contributing

To contribute to the development of the payment engine, you need to clone the
repository `https://github.com/hubiinetwork/omphalos-error-utils.git`.

We also follow a few practices that we expect contributors to also adhere too.

### Practices

**Branching Model**

The master branch is expected to always be in a _green_ state. Every commit to
master is expected generate a new NPM release of the library.
For more long lasting work, create a feature branch and merge it through a
pull request.

**Pull Request**

Don't just push a new branch and expect us to magically discover it and do
something with it; also make sure you create a pull request for your branch
where the changes can be examined and findings recorded in a organized manner.

If your changes address either partially, or fully, an open issue in the
backlog, make sure to reference it in the description of your pull requests.

Also make sure to reference one or more of the admins of the repo and set them
as reviewers for your pull request.

**Code Review**

As part of the pull requests all reviewers should as soon as possible provide
constructive feedback on the pull request.

The reviewer should look at the following as a minimum:

    - Code quality, readability, maintainability, performance, security
    - Test code quality, coverage, readability, maintainability
    - Design of any public APIs, including documentation
    - Overall architecture of solution, does it fit with current designs
    - Missed opportunities: simplification of design, refactoring, invalidation
      of previous assumptions

**Test Driven Development (TDD)**

Why? Because done right, the codebase becomes better and getting full test
coverage becomes trivial. Always start by writing a test that turns *red*, then
change your production code to turn it (and all other tests) *green* again. Then
do some refactoring as needed. Rinse and repeat. Follow the cycle
"red-green-refactor" and don't leave any of the steps out! And yes, an
experienced TDD practitioner can in most cases easily spot code that has not
been created using TDD.

There is no need to limit you test suite to only have unit tests, but the unit
tests themselves should have ~100% code coverage.

## Who do I talk to?

* [Jacobo Toll-Messia](mailto:jacobo@hubii.com)
* [Morten Fjeldstad](mailto:morten@hubii.com)
