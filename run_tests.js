// Simple script runner used to test Node.JS.

if (process.env.CLOUDMINE_APPID && process.env.CLOUDMINE_APIKEY) {
  var qunit = require('qunit');
  var config = {
    deps: [ "./tests/init.js", "./tests/util.js", "./tests/config.js" ],
    code: {path: "./js/cloudmine.js", namespace: "cloudmine"},
    tests: "./tests/tests.js"
  };

  qunit.run(config);
} else {
  console.log("Cannot run tests without specifying an application id and api key.");
  console.log("Please export the following variables in your shell:");
  console.log("  CLOUDMINE_APPID: This should be the application id to test under");
  console.log("  CLOUDMINE_APIKEY: This should be the api key to test under");
  console.log("\nUnit tests may leave behind stale users and data.");
  console.log("It is not recommended to run unit tests on a production application.");
}
