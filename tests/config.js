(function() {
  var config = {
    appid: null,
    apikey: null,
    apiroot: null
  };
  
  if (!this.inBrowser) {
    config.appid = process.env['CLOUDMINE_APPID'];
    config.apikey = process.env['CLOUDMINE_APIKEY'];
    config.apiroot = process.env['CLOUDMINE_APIROOT'];
  } else {
    var saved = (window.localStorage ? JSON.parse(localStorage.getItem('cm_info')) : null) || {};
    config.appid = saved.appid || prompt("Please enter an Application Identifier", "");
    config.apikey = saved.apikey || prompt("Please enter an API Key", "");
    config.apiroot = saved.apiroot || prompt("Please enter an API Root", "");

    if (window.localStorage) {
      localStorage.setItem('cm_info', JSON.stringify({
        appid: config.appid,
        apikey: config.apikey,
        apiroot: config.apiroot
      }));
    }
  }
  
  if (!config.appid || !config.apikey || !config.apiroot) {
    if (!this.inBrowser) {
      console.log("Please use 'cake --app appid --key apikey --apiroot apiroot test' instead of invoking directly."); 
      console.log("\nThese unit tests are not guarenteed to cleanup after itself during failure.");
      console.log("Avoid using a production application to run tests.");
    } else {
      alert("You must set an application id, api key, and apiroot to run tests.\n\nThese unit tests are not guaranteed to cleanup after itself during failure.\nAvoid using a production application to run tests.");
    }
    throw new Error("System not configured.");
  }

  Export('./config', config);
})();
