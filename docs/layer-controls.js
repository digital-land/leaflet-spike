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
  this.datasetNames = this.$controls.map($control => $control.dataset.layerControl)

  // listen for changes to URL
  var boundSetControls = this.setControls.bind(this)
  window.addEventListener('popstate', function (event) {
    console.log("URL has changed - back button")
    boundSetControls()
  })

  // initial set up of controls (default or urlParams)
  const urlParams = (new URL(document.location)).searchParams
  if (!urlParams.has('layer')) {
    // if not set then use default checked controls
    this.updateURL()
  } else {
    // use URL params if available
    this.setControls()
  }

  var boundControlChkbxChangeHandler = this.onControlChkbxChange.bind(this)

  this.$controls.forEach(function ($control) {
    console.log(this)
    $control.addEventListener('change', boundControlChkbxChangeHandler, true)
  }, this)

  return this
}

LayerControls.prototype.onControlChkbxChange = function (e) {
  console.log("I've been toggled", e.target, this)

  var $clickedControl = e.target.closest(this.layerControlSelector)

  const datasetName = this.datasetName($clickedControl)
  console.log(datasetName)
  this.updateURL()

  // run provided callback
  const enabled = this.getCheckbox($clickedControl).checked
  if (this.toggleControlCallback && isFunction(this.toggleControlCallback)) {
    this.toggleControlCallback(this.map, this.datasetName($clickedControl), enabled)
  }
}

LayerControls.prototype.get = function (dataset) {
  return this.$controls.filter($control => $control.dataset.layerControl === dataset)
}

LayerControls.prototype.enable = function ($control) {
  console.log('enable', this.datasetName($control))
  const $chkbx = $control.querySelector('input[type="checkbox"]')
  $chkbx.checked = true
  $control.dataset.layerControlActive = 'true'
  $control.classList.remove(this.layerControlDeactivatedClass)
}

LayerControls.prototype.disable = function ($control) {
  console.log('disable', this.datasetName($control))
  const $chkbx = $control.querySelector('input[type="checkbox"]')
  $chkbx.checked = false
  $control.dataset.layerControlActive = 'false'
  $control.classList.add(this.layerControlDeactivatedClass)
}

LayerControls.prototype.setControls = function () {
  const urlParams = (new URL(document.location)).searchParams

  if (urlParams.has('layer')) {
    // get the names of the enabled and disabled layers
    // only care about layers that exist
    const enabledLayerNames = urlParams.getAll('layer').filter(name => this.datasetNames.indexOf(name) > -1)
    console.log('Enable:', enabledLayerNames)

    const datasetNamesClone = [].concat(this.datasetNames)
    const disabledLayerNames = datasetNamesClone.filter(name => enabledLayerNames.indexOf(name) === -1)

    // map the names to the controls
    const toEnable = enabledLayerNames.map(name => this.get(name)[0])
    const toDisable = disabledLayerNames.map(name => this.get(name)[0])
    console.log(toEnable, toDisable)

    // pass correct this arg
    toEnable.forEach(this.enable, this)
    toDisable.forEach(this.disable, this)
  }
}

LayerControls.prototype.updateURL = function () {
  const urlParams = (new URL(document.location)).searchParams
  const enabledLayers = this.enabledLayers().map($control => this.datasetName($control))

  urlParams.delete('layer')
  enabledLayers.forEach(name => urlParams.append('layer', name))
  console.log(urlParams.toString())
  const newURL = window.location.pathname + '?' + urlParams.toString() + window.location.hash
  window.history.pushState({}, '', newURL)
  this.setControls()
}

LayerControls.prototype.getCheckbox = function ($control) {
  return $control.querySelector('input[type="checkbox"]')
}

LayerControls.prototype.enabledLayers = function () {
  return this.$controls.filter($control => this.getCheckbox($control).checked)
}

LayerControls.prototype.disabledLayers = function () {
  return this.$controls.filter($control => !this.getCheckbox($control).checked)
}

LayerControls.prototype.datasetName = function ($control) {
  return $control.dataset.layerControl
}

LayerControls.prototype.setupOptions = function (params) {
  params = params || {}
  this.layerControlSelector = params.layerControlSelector || '[data-layer-control]'
  this.layerControlDeactivatedClass = params.layerControlDeactivatedClass || 'deactivated-control'
  this.toggleControlCallback = params.toggleControlCallback || undefined
}
