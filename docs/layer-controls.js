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
  this.setupOptions(params)
  // returns a node list so convert to array
  var $controls = this.$module.querySelectorAll(this.layerControlSelector)
  this.$controls = Array.prototype.slice.call($controls)

  var boundControlClickHandler = this.onControlClick.bind(this)

  this.$controls.forEach(function ($control) {
    $control.addEventListener('click', boundControlClickHandler, true)
  })

  return this
}

LayerControls.prototype.onControlClick = function (e) {
  console.log("I've been clicked", e.target, this)
  var $currentControl = e.target
  this.toggleActive($currentControl)
}

LayerControls.prototype.toggleActive = function ($control) {
  console.log($control)
  if ($control.dataset.layerControlActive === 'true') {
    $control.dataset.layerControlActive = 'false'
    $control.classList.add(this.layerControlDeactivatedClass)
    console.log('currently active so deactivating', this.layerControlDeactivatedClass)
  } else {
    $control.dataset.layerControlActive = 'true'
    $control.classList.remove(this.layerControlDeactivatedClass)
  }
}

LayerControls.prototype.activeLayers = function () {
  return this.$controls.filter(($control) => $control.dataset.layerControlActive === 'true')
}

LayerControls.prototype.deactivatedLayers = function () {
  return this.$controls.filter(($control) => $control.dataset.layerControlActive === 'false')
}

LayerControls.prototype.datasetType = function ($control) {
  return $control.dataset.layerControl
}

LayerControls.prototype.setupOptions = function (params) {
  params = params || {}
  this.layerControlSelector = params.layerControlSelector || '[data-layer-control]'
  this.layerControlDeactivatedClass = params.layerControlDeactivatedClass || 'deactivated-control'
}
