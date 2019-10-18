sap.ui.define(
  [
    'sap/ui/core/UIComponent',
    'sap/ui/Device',
    'pslint/exp/model/models',
    'jquery.sap.global',
    'jquery.sap.storage',
  ],
  function(UIComponent, Device, models) {
    'use strict';

    return UIComponent.extend('pslint.exp.Component', {
      metadata: {
        manifest: 'json',
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and
       * calls the init method once.
       * @public
       * @override
       */
      init: function() {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);
        // load additionaly libs
        // sap.ui.getCore().loadLibrary('sap.ui.layout', { async: true });
        sap.ui.getCore().loadLibrary('sap.ui.commons', { async: true });
        sap.ui.getCore().loadLibrary('sap.ui.core', { async: true });
        sap.ui.getCore().loadLibrary('sap.m', { async: true });
        sap.ui.getCore().loadLibrary('tsystems.rus.custom', { async: true });
        sap.ui.require(
          ['sap/ui/thirdparty/datajs', 'sap/ui/model/odata/v2/ODataModel'],
          function(datajs, oDataModel) {
            this.oMainModel = new oDataModel('/sap/opu/odata/sap/ZPM_COMMON_SRV/');
            this.setModel(this.oMainModel, undefined);
          }.bind(this)
        );
        // Create connection to addition oData service or do request
        // set the device model
        this.setModel(models.createDeviceModel(), 'device');
        this._oStorage = this.createStorage();

        this._oMessageManager = sap.ui.getCore().getMessageManager();
        // Get message model
        this._oMessageManager.registerObject(this, true);
        this.setModel(this._oMessageManager.getMessageModel(), 'messages');
        // init oData

        // init comp
        this.getScanComponent();
        // Router
        this.getRouter().initialize();
      },

      getStorage: function() {
        return this._oStorage;
      },

      getMessageManager: function() {
        return this._oMessageManager;
      },

      getMessagePopover: function() {
        if (!this._oMessagePopover) {
          this._oMessagePopover = new sap.m.MessagePopover({
            items: {
              path: '/',
              template: new sap.m.MessageItem({
                type: '{type}',
                title: '{message}',
                description: '{description}',
              }),
            },
            headerButton: new sap.m.Button({
              icon: 'sap-icon://delete',
              tooltip: '{i18n>titleClear}',
            }).attachPress(this.onClearMessagesPress, this),
          });
          this._oMessagePopover.setModel(this.getModel('messages'));
        }
        return this._oMessagePopover;
      },

      onClearMessagesPress: function() {
        this.getMessageManager().removeAllMessages();
      },

      createStorage: function() {
        var oStorage;
        if (jQuery.sap.storage.isSupported()) {
          oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        } else {
          jQuery.sap.log.warning('Storage is not suported');
          oStorage = {
            store: {},
            put: function(key, data) {
              this.store[key] = data;
            },
            get: function(key) {
              return this.store[key];
            },
            remove: function(key) {
              delete this.store[key];
            },
            clear: function() {
              this.store = {};
            },
          };
        }
        return oStorage;
      },

      getScanComponent: function() {
        if (!this._oScanerComp) {
          this._oScanerComp = sap.ui.component({
            name: 'tsystems.rus.custom.comp.ExtScanner',
            settings: {},
            componentData: {},
            async: true,
            manifest: true,
          });
        }
        return this._oScanerComp;
      },
    });
  }
);
