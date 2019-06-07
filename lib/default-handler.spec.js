'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

const {mockReq, mockRes} = require('sinon-express-mock');

const {HttpError} = require('../index');
const handler = require('./default-handler');

describe('defaultHandler middleware', () => {
    let error, req, res;

    beforeEach(() => {
        req = mockReq();
        res = mockRes();
    });

    context('on any request', () => {
        let err;

        beforeEach((done) => {
            handler(req, res, e => {
                err = e;
                done();
            })
        });

        it('yields an 404 HttpError', () => {
            expect(err).to.be.an.instanceOf(HttpError);
            expect(err.code).to.eql(404);
            expect(err.message).to.match(/not found/i);
        });
    });
});
