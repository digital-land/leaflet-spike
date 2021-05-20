function isFunction (x) {
  return Object.prototype.toString.call(x) === '[object Function]'
}

function nodeListForEach (nodes, callback) {
  if (window.NodeList.prototype.forEach) {
    return nodes.forEach(callback)
  }
  for (var i = 0; i < nodes.length; i++) {
    callback.call(window, nodes[i], i, nodes)
  }
}

function LayerControls ($module, leafletMap) {
  this.$module = $module
  this.map = leafletMap
}

LayerControls.prototype.init = function (params) {
  this.setupOptions(params)
  // returns a node list so convert to array
  var $controls = this.$module.querySelectorAll(this.layerControlSelector)
  this.$controls = Array.prototype.slice.call($controls)

  var boundControlChkbxChangeHandler = this.onControlChkbxChange.bind(this)

  this.$controls.forEach(function ($control) {
    console.log(this)
    this.initialState($control)
    $control.addEventListener('change', boundControlChkbxChangeHandler, true)
  }, this)

  return this
}

LayerControls.prototype.onControlChkbxChange = function (e) {
  console.log("I've been changed", e.target, this)

  var $currentControl = e.target.closest(this.layerControlSelector)
  this.toggleActive($currentControl)
  this.map._fetchSinceControlAction = false
}

LayerControls.prototype.toggleActive = function ($control) {
  let enabling
  if ($control.dataset.layerControlActive === 'true') {
    $control.dataset.layerControlActive = 'false'
    $control.classList.add(this.layerControlDeactivatedClass)
    console.log('currently active so deactivating', this.layerControlDeactivatedClass)
    enabling = false
  } else {
    $control.dataset.layerControlActive = 'true'
    $control.classList.remove(this.layerControlDeactivatedClass)
    enabling = true
  }
  // run provided callback
  if (this.toggleControlCallback && isFunction(this.toggleControlCallback)) {
    this.toggleControlCallback(this.map, this.datasetType($control), enabling)
  }
}

LayerControls.prototype.initialState = function ($control) {
  const $chkbx = $control.querySelector('input[type="checkbox"]')
  if ($control.dataset.layerControlActive === 'true') {
    $chkbx.checked = true
    $control.classList.remove(this.layerControlDeactivatedClass)
  } else {
    $chkbx.checked = false
    $control.classList.add(this.layerControlDeactivatedClass)
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
  this.toggleControlCallback = params.toggleControlCallback || undefined
}
