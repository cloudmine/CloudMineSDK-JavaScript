// Simple script runner used to test Node.JS.

if (process.argv.length == 4) {
  process.env.CLOUDMINE_APPID = process.argv[2];
  process.env.CLOUDMINE_APIKEY = process.argv[3];
  var qunit = require('qunit');
  var config = {
    deps: [ "./tests/init.js", "./tests/util.js", "./tests/config.js" ],
    code: {path: "./js/cloudmine.js", namespace: "cloudmine"},
    tests: "./tests/tests.js"
  };

  qunit.run(config);
} else {
  console.log("Cannot run tests without specifying an application id and api key.");
  console.log("Usage: node run_tests.js appid apikey");
  console.log("node run_tests.js 793dcffc4f67f94c36a8f20628d3d31b 8b05c2e5d0e88b471c5aae8ba6cf9f7b");
}
