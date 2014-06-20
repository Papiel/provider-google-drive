"use strict";

var async = require('async');
var wEnd = require('../helpers/waterfall-end.js');

module.exports.post = function(req, res, next) {
  var store = req.app.get('keyValueStore');
  var queue = req.app.get('queue');
  var jobDesc = {
    title: "Update for " + req.body.access_token,
    anyfetchToken: req.body.access_token
  };
  async.waterfall([
    function getStatus(cb) {
      store.hget('status', req.body.access_token, cb);
    },
    function getCursor(status, cb) {
      if(status) {
        return cb(new Error('already processing'));
      }
      store.hget('cursors', req.body.access_token, cb);
    },
    function getOtherToken(cur, cb) {
      jobDesc.cursor = cur;

      store.hget('tokens', req.body.access_token, cb);
    },
    function setUpdateLock(token, cb) {
      if(!token) {
        return cb(new Error('token ' + req.body.access_token + ' not initialized'));
      }
      jobDesc.providerToken = token;

      store.hset('status', req.body.access_token, 'true', cb);
    },
    function respondAndStartJob(status, cb) {
      queue
        .create('update', jobDesc)
        .priority('low')
        .attempts(10)
        .save();
      res.send(204);
      res.end();
      cb();
    }
  ], wEnd(next));
};
