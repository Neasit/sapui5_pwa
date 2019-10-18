sap.ui.define(['pslint/exp/controller/BaseController', 'pslint/exp/model/models'], function(
  BaseController,
  model
) {
  'use strict';

  return BaseController.extend('pslint.exp.controller.StartPage', {
    // sLang: null, Test

    onInit: function() {
      // Models
      this._oi18n = this.getResourceBundle();
      this._oODataModel = this.getOwnerComponent().getModel();
      // routing
      this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      this.oRouter.getRoute('StartPage').attachPatternMatched(this.handleRouteMatched, this);
      // init model
      this.oModel = model.createLocalModel(this.getOwnerComponent().getStorage());
      this.getView().setModel(this.oModel, 'local');
    },

    // Router
    handleRouteMatched: function(oEvent) {
      // first screen
    },

    onSearch: function(oEvent) {},

    onScan: function() {
      this.getOwnerComponent()
        .getScanComponent()
        .then(
          function(oComp) {
            if (!this.oScanner) {
              this.oScanner = oComp;
              this.oScanner.attachValueScanned(this.valueScanned.bind(this));
            }
            this.oScanner.open();
          }.bind(this)
        )
        .catch(
          function() {
            this.showMessage(this._oi18n.getText('errorByScan'));
          }.bind(this)
        );
    },

    valueScanned: function(oEvent) {
      var sValue = oEvent.getParameter('value');
      if (sValue) {
        var aData = this.oModel.getProperty('/data');
        aData.push({
          MaterialNumber: 'New',
          UII: sValue,
          Quntity: 1,
        });
        this.oModel.setProperty('/data', aData);
      } else {
        this.showMessage(this._oi18n.getText('EmptyValueScanned'));
      }
    },
  });
});
