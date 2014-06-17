"use strict";

var should = require('should');
var async = require('async');
var request = require('supertest');
var url = require('url');
var app = require('../../../app.js');

describe("GET /init/callback", function() {
  beforeEach(function eraseHash(done) {
    app.get('keyValueStore').del('googleTokens', done);
  });

  it('should associate successfully the anyfetch access token and the gdrive refresh token in the key/value store if google gives a positive response', function(done) {
    async.waterfall([
      function queryCallback(cb) {
        request(app)
          .get('/init/callback')
          .query({
            code: 'aGoogleCode',
            state: 'aCode'
          })
          .expect(302)
          .end(cb);
      },
      function assertRedirection(res, cb) {
        var components = url.parse(res.headers.location, true);
        var manager = url.parse(app.get('anyfetch.managerUrl'));
        components.should.have.property('protocol', manager.protocol);
        components.should.have.property('host', manager.host);
        components.should.have.property('pathname', '/tokens');
        cb();
      },
      function queryRedis(cb) {
        app.get('keyValueStore')
          .hget('googleTokens', 'anAccessToken', cb);
      },
      function assertStoredValue(value, cb) {
        value.should.be.exactly('aGoogleRefreshToken');
        cb();
      }
    ], done);
  });

  it('should not set anything if google gives a negative response', function(done) {
    async.waterfall([
      function queryCallback(cb) {
        request(app)
          .get('/init/callback')
          .query({
            error: 'access_denied',
            state: 'aCode'
          })
          .expect(500)
          .expect(/access_denied/)
          .end(cb);
      },
      function queryRedis(res, cb) {
        app.get('keyValueStore')
          .hget('googleTokens', 'anAccessToken', cb);
      },
      function assertStoredValue(value, cb) {
        should(value).be.exactly(null);
        cb();
      }
    ], done);
  });
});