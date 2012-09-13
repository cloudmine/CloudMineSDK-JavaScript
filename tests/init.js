(function() {
  var base = this.window ? window : root;

  // Initialization code for Unit tests
  // Consistency for 'loading' features for Node.JS/Browsers
  function Export(name, map) {
    if (!this.window) {
      module.exports = map;
    } else {
      if (!Export.data) Export.data = {};
      Export.data[name] = map;
    }
  }

  function Import(name) {
    return this.window ? Export.data[name] : require(name);
  }

  // Mass create null types if they aren't present
  var types = [ 'ArrayBuffer', 'Buffer', 'FileReader', 'Uint8Array', 'CanvasRenderingContext2D' ];
  for (var i = 0; i < types.length; ++i) {
    if (base[types[i]] === undefined) base[types[i]] = null;
  }

  if (!base.$) $ = function(func) {
    return func instanceof 'function' ? func.apply(this.arguments) : [];
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
