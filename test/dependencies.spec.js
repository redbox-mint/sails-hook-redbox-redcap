const Sails = require('sails').Sails;
const assert = require('assert');
var supertest = require('supertest');

const RedcapService = require('../api/services/RedcapService');

describe('Basic tests ::', function () {

  // Var to hold a running sails app instance
  var sails;
  // Before running any tests, attempt to lift Sails
  before(function (done) {

    // Hook will timeout in 10 seconds
    this.timeout(11000);

    // Attempt to lift sails
    Sails().lift({
      hooks: {
        // Load the hook
        "sails-hook-redbox-redcap": require('../'),
        // Skip grunt (unless your hook uses it)
        "grunt": false
      },
      form: {forms: {}}, //Mock forms to test hook.configure()
      log: {level: "error"}
    }, function (err, _sails) {
      if (err) return done(err);
      sails = _sails;
      return done();
    });
  });

  /*it('should have a service', function (done) {
    assert.equal(sails.services['RedcapService'].exportProject(), null);
    done();
  });

  it('should have a form', function (done) {
    const type = sails.config['form']['forms']['redcap-1.0-draft']['type'];
    assert.equal(type, 'redcap');
    done();
  });

  it('should have a route', function (done) {
    supertest(sails.hooks.http.app)
      .get('/:branding/:portal/ws/redcap/info')
      .expect(200)
      .end(function (err, res) {
        assert.equal(res.text, '');
        done();
      });
  });*/

  // After tests are complete, lower Sails
  after(function (done) {

    // Lower Sails (if it successfully lifted)
    if (sails) {
      return sails.lower(done);
    }
    // Otherwise just return
    return done();
  });

  // Test that Sails can lift with the hook in place
  it('sails does not crash', function () {
    return true;
  });

});
