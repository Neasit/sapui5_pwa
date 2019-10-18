'use strict';
/* eslint-disable */
var fInit = function() {
  if (fLoadScript) {
    fLoadScript(
      'resources/sap-ui-core.js',
      {
        id: 'sap-ui-bootstrap',
        'data-sap-ui-libs': 'sap.m',
        'data-sap-ui-theme': 'sap_belize',
        'data-sap-ui-compatVersion': 'edge',
        'data-sap-ui-preload': 'async',
        'data-sap-ui-resourceroots': '{"pslint.exp": "./"}',
      },
      fUI5Loaded
    );
  }
};
var fUI5Loaded = function() {
  sap.ui.loader.config({
    // location from where to load all modules by default
    baseUrl: 'resources/',
    // activate real async loading and module definitions
    async: true,
  });
  sap.ui.getCore().attachInit(function() {
    sap.ui.require(['sap/m/Shell', 'sap/ui/core/ComponentContainer'], function(
      Shell,
      ComponentContainer
    ) {
      // server.init();
      // initialize the UI component
      //
      sap.ui
        .component({
          name: 'pslint.exp',
          manifest: true,
          async: true,
        })
        .then(function(oComp) {
          var oContainer = new ComponentContainer({ height: '100%', component: oComp });
          new Shell({
            app: oContainer,
          }).placeAt('content');
        });
    });
  });
};

window.addEventListener('load', function() {
  var oReady = Promise.resolve();

  if ('serviceWorker' in navigator) {
    oReady = navigator.serviceWorker.register('/service-worker.js');
  }
  oReady
    .then(function(oSW) {
      console.log('Service worker is registered!');
      fInit();
    })
    .catch(function(error) {
      console.error('Error by load Service Worker!');
      fInit();
    });
});
