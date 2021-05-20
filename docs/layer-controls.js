function nodeListForEach (nodes, callback) {
  if (window.NodeList.prototype.forEach) {
    return nodes.forEach(callback)
  }
  for (var i = 0; i < nodes.length; i++) {
    callback.call(window, nodes[i], i, nodes)
  }
}

function LayerControls ($module) {
  this.$module = $module
}

LayerControls.prototype.init = function (params) {
  this.$controls = this.$module.querySelectorAll(this.layerControlSelector)

  var boundControlClickHandler = this.onControlClick.bind(this)

  nodeListForEach(this.$controls, function ($control) {
    $control.addEventListener('click', boundControlClickHandler, true)
  })

  return this
}

LayerControls.prototype.onControlClick = function (e) {
  console.log("I've been clicked", e.target, this)
}

LayerControls.prototype.setupOptions = function (params) {
  params = params || {}
  this.layerControlSelector = params.layerControlSelector || '[data-layer-control]'
}
