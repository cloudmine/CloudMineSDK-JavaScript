(function() {
  var config = {
    appid: null,
    apikey: null
  };
  
  if (!this.inBrowser) {
    config.appid = process.env['CLOUDMINE_APPID'];
    config.apikey = process.env['CLOUDMINE_APIKEY'];
  } else {
    var saved = (window.localStorage ? JSON.parse(localStorage.getItem('cm_info')) : null) || {};
    config.appid = saved.appid || prompt("Please enter an Application Identifier", "");
    config.apikey = saved.apikey || prompt("Please enter an API Key", "");

    if (window.localStorage) {
      localStorage.setItem('cm_info', JSON.stringify({
        appid: config.appid,
        apikey: config.apikey
      }));
    }
  }
  
  if (!config.appid || !config.apikey) {
    if (!this.inBrowser) {
      console.log("You must set the following environment variables before running unit tests.");
      console.log("   CLOUDMINE_APPID: This is the application id to test under");
      console.log("   CLOUDMINE_APIKEY: This is the api key to test under");
      console.log("\nThese unit tests are not guarenteed to cleanup after itself during failure.");
      console.log("Avoid using a production application to run tests.");
    } else {
      alert("You must set an application id and api key to run tests.\n\nThese unit tests are not guaranteed to cleanup after itself during failure.\nAvoid using a production application to run tests.");
    }
    throw new Error("System not configured.");
  }

  Export('./config', config);
})();
