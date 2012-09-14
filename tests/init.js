(function() {
  var base = this.window ? window : root;

  // Initialization code for Unit tests
  // Consistency for 'loading' features for Node.JS/Browsers
  var exports = {};
  function Export(name, data) {
    exports[name] = data;
    return data;
  }

  function Import(name) {
    if (!this.window && !exports[name]) {
      exports[name] = require(name);
    }
    return exports[name];
  }

  // Mass create null types if they aren't present
  var types = [ 'ArrayBuffer', 'Buffer', 'FileReader', 'Uint8Array', 'CanvasRenderingContext2D' ];
  for (var i = 0; i < types.length; ++i) {
    if (base[types[i]] === undefined) base[types[i]] = null;
  }

  if (!base.$) $ = function(func) {
    return typeof func == 'function' ? func.apply(this, arguments) : func;
  }

  // Force a few types into the global scope.
  base.Export = Export;
  base.Import = Import;
  base.inBrowser = !!this.window;
  base.console = base.console || { log: function() {} };
  base.hasBuffers = Buffer || (Uint8Array && ArrayBuffer);

  // QUnit-- Please run in order. I don't case if you think the tests are fubar.
  QUnit.config.reorder = false;
})();
