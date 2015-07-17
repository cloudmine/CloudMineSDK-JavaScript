var assert = require('assert');
var nock = require('nock');


var cloudmine = require('../js/cloudmine.js');
var config = {};
config.appid = process.env['CLOUDMINE_APPID'];
config.apikey = process.env['CLOUDMINE_APIKEY'];
config.apiroot = process.env['CLOUDMINE_APIROOT'];

describe("Headers should", function() {
  var webservice = new cloudmine.WebService({
    appid: config.appid,
    apikey: config.apikey,
    apiroot: config.apiroot,
    appname: 'UnitTests',
    appversion: cloudmine.WebService.VERSION
  });
  function hex() {
    return Math.round(Math.random() * 16).toString(16)
  }

  function uuid() {
    var out = Array(32), i;
    out[14] = 4;
    out[19] = ((Math.round(Math.random() * 16) & 3) | 8).toString(16);
    for (i = 0; i < 14; ++i) { out[i] = hex(); }
    for (i = 15; i < 19; ++i) { out[i] = hex(); }
    for (i = 20; i < 32; ++i) { out[i] = hex(); }
    return out.join('');
  }

  it("Should limit UT headers to 20 total", function(done) {

    var totalReturned = 0;
    for(var i = 0; i < 30; i++) {
      nock(config.apiroot).get('/v1/app/' + config.appid + '/text?keys=test').delay(1000).reply(200, { success: {}, errors: {} }, { 'X-Request-Id': uuid()});
      webservice.get('test').on('complete', function(body, data) {
        totalReturned++;
        if(totalReturned == 30) {
          nock(config.apiroot).get('/v1/app/' + config.appid + '/text?keys=lastrequest').reply(200, { success: {}, errors: {} }, { 'X-Request-Id': uuid()});
          webservice.get('lastrequest').on('complete', function(body, data) {
            var UT = data.requestHeaders['X-CloudMine-UT'];
            console.log(UT);
            assert.equal(20, UT.split(',').length);
            done();
          });

        }
      });
    }
  });

  it("Should not add Unique ID header if global is not defined", function(done) {
    nock(config.apiroot).get('/v1/app/' + config.appid + '/text?keys=test').delay(1000).reply(200, { success: {}, errors: {} });
    webservice.get('test').on('complete', function(body, data) {
      assert.equal(undefined, data.requestHeaders['X-Unique-Id']);
      done();
    });
  });

  it("Should add Unique ID header if global is defined", function(done) {
    _$XUniqueID = 'abc123456789';
    nock(config.apiroot).get('/v1/app/' + config.appid + '/text?keys=test').delay(1000).reply(200, { success: {}, errors: {} });
    webservice.get('test').on('complete', function(body, data) {
      var uniqueIdHeader = data.requestHeaders['X-Unique-Id']
      console.log('uniqueid:',uniqueIdHeader);
      assert.equal(_$XUniqueID, uniqueIdHeader);
      done();
    });
  });

});
