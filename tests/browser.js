// Browser specific functionality.
(function() {
  var host = window.localStorage ? localStorage.getItem('cm_host') : null;
  if (host) {
    window.cloudmine = {API: host};
  }
})();

function dom(selector) {
  return document.querySelectorAll(selector);
}  

$(function() {
  var forgetApp = dom('.forgetapp')[0];
  var forgetHost = dom('.forgethost')[0];
  if (window.localStorage) {
    forgetApp.addEventListener('click', function() {
      localStorage.removeItem('cm_info');
      location.reload();
    }, false);

    if (!localStorage.getItem('cm_host')) {
      forgetHost.addEventListener('click', function() {
        var host = prompt("Enter API Host");
        if (host && host.replace(/\s+/g, '') != '') {
          localStorage.setItem('cm_host', host);
          location.reload();
        }
      }, false);
      forgetHost.innerText = 'Set API Host';
    } else {
      forgetHost.addEventListener('click', function() {
        if (window.localStorage) {
          localStorage.removeItem('cm_host');
          location.reload();
        }
      }, false);
    }
  } else {
    forgetHost.parentNode.removeChild(forgetHost);
    forgetApp.parentNode.removeChild(forgetApp);
  }
});
