'use strict';
/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const chai = Object.create(require('chai'));
const proxyquire = require('proxyquire').noPreserveCache().noCallThru();

const expect = chai.expect;
const given = describe;
const when = describe;

const fakeLogFn = sinon.stub();

function testDelayed(test, done) {
    setTimeout(() => {
        try {
            test();
        }
        catch (err) {
            done(err);
            return;
        }
        done();
    }, 10);
}

describe('handle-unhandled-errors', () => {
    const original = {
        exit: process.exit
    };

    let initUnhandledErrorsHandler;

    beforeEach(() => {
        original.exception = process.listeners('uncaughtException').pop();
        process.removeListener('uncaughtException', original.exception);
        initUnhandledErrorsHandler = proxyquire('./unhandled-errors-handler', {}).initUnhandledErrorsHandler;
        process.exit = sinon.stub();
    });

    afterEach(() => {
        process.listeners('uncaughtException').push(original.exception);
        process.removeListener('unhandledRejection', process.listeners('unhandledRejection').pop());
        fakeLogFn.reset();
        process.exit = original.exit;
    });

    it ('is accessible from top-level index file', () => {
        const { initUnhandledErrorsHandler } = require('../index');
        expect(typeof initUnhandledErrorsHandler).to.equal('function');
        initUnhandledErrorsHandler(fakeLogFn); // ensure cleanup works
    });

    given('unhandled handler', () => {
        when ('initialized', () => {
            it ('succeeds when initialized once', () => {
                expect(() => initUnhandledErrorsHandler(fakeLogFn)).to.not.throw();
            });

            it ('fails when initialized more than once', () => {
                expect(() => initUnhandledErrorsHandler(fakeLogFn)).to.not.throw();
                expect(() => initUnhandledErrorsHandler(fakeLogFn)).to.throw('Illegal attempt to initialize multiple times');
            });

            it ('fails logger is not a function', () => {
                expect(() => initUnhandledErrorsHandler({})).to.throw('logFn argument is not a function');
                initUnhandledErrorsHandler(fakeLogFn); // ensure cleanup works
            });
        });

        when('some unhandled failure occurs', () => {
            beforeEach(() => {
                initUnhandledErrorsHandler(fakeLogFn);
            });

            it('handles uncaught exceptions', (done) => {
                process.nextTick(() => {
                    throw new Error('Error');
                });

                testDelayed(() => {
                    expect(fakeLogFn.args[0][0]).to.equal('Failure: Uncaught exception detected!');
                    expect(fakeLogFn.args[1][0]).to.equal('Error');
                }, done);
            });

            it('handles uncaught rejection with Error reason', (done) => {
                process.nextTick(() => {
                    Promise.reject(new Error('Error reason'));
                });

                testDelayed(() => {
                    expect(fakeLogFn.args[0][0]).to.equal('Failure: Unhandled rejection detected!');
                    expect(fakeLogFn.args[1][0]).to.equal('Error reason');
                }, done);
            });

            it('handles uncaught rejection with only reason', (done) => {
                process.nextTick(() => {
                    Promise.reject('only reason');
                });

                testDelayed(() => {
                    expect(fakeLogFn.args[0][0]).to.equal('Failure: Unhandled rejection detected!');
                    expect(fakeLogFn.args[1][0]).to.equal('only reason');
                }, done);
            });

            it('handles uncaught rejection without reason', (done) => {
                process.nextTick(() => {
                    Promise.reject();
                });

                testDelayed(() => {
                    expect(fakeLogFn.args[0][0]).to.equal('Failure: Unhandled rejection detected!');
                    expect(fakeLogFn.args[1][0]).to.equal('Rejection does not come with a reason');
                }, done);
            });
        });
    });
});
