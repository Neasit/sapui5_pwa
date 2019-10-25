sap.ui.define(
  ['pslint/exp/controller/BaseController', 'pslint/exp/model/models', 'pslint/exp/utils/Scanner'],
  function(BaseController, model, Scanner) {
    'use strict';

    return BaseController.extend('pslint.exp.controller.StartPage', {
      // sLang: null, Test

      onInit: function() {
        // Models
        this._oi18n = this.getResourceBundle();
        // routing
        this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        this.oRouter.getRoute('StartPage').attachPatternMatched(this.handleRouteMatched, this);
        // init model
        this._storeKey = 'scannedData';
        this.oModel = model.createLocalModel(this.getOwnerComponent().getStorage(), this._storeKey);
        this.getView().setModel(this.oModel, 'local');
        this.checkSync();
      },

      checkSync: function() {
        var aData = this.oModel.getProperty('/data');
        var bActive = false;
        if (aData && aData.length) {
          bActive = true;
        }
        this.oModel.setProperty('/syncActive', bActive);
      },

      // Router
      handleRouteMatched: function() {
        // first screen
      },

      getScanner: function() {
        if (!this.oScanner) {
          this.oScanner = new Scanner(
            true,
            this,
            this.getView().getModel('i18n'),
            this.valueScanned.bind(this),
            this.onCancel.bind(this)
          );
        }
        return this.oScanner;
      },

      onScan: function() {
        this.getScanner().open();
      },

      onCancel: function() {
        this.showMessage(this._oi18n.getText('CancelByUser'));
      },

      onDelete: function(oEvent) {
        var aData = this.oModel.getProperty('/data');
        var oItem = oEvent.getParameter('listItem');
        var oContext = oItem.getBindingContext('local');
        if (oContext) {
          var sIndex = oContext.getPath().split('/')[2];
          if (sIndex) {
            aData.splice(parseInt(sIndex), 1);
            this.oModel.setProperty('/data', aData);
          }
        }
        this.checkSync();
      },

      onSync: function() {
        this.showBusyIndicator(0);
        setTimeout(
          function() {
            this.oModel.setProperty('/data', []);
            this.checkSync();
            this.getOwnerComponent()
              .getStorage()
              .clear();
            this.addMessagesToModel(
              [
                {
                  Text: this._oi18n.getText('msgSyncSuccess'),
                  Type: 'S',
                },
              ],
              this._oi18n.getText('msgSyncDone')
            );
            this.hideBusyIndicator();
            this.showMessage(this._oi18n.getText('msgSyncDone'));
          }.bind(this),
          2000
        );
      },

      onSave: function() {
        var aData = this.oModel.getProperty('/data');
        var oStore = this.getOwnerComponent().getStorage();
        oStore.clear();
        oStore.put(this._storeKey, JSON.stringify(aData));
        this.showMessage(this._oi18n.getText('dataSaved'));
      },

      valueScanned: function(sValue) {
        if (sValue) {
          var aData = this.oModel.getProperty('/data');
          var oData = this.decodeBarCode(sValue);
          if (
            !aData.some(function(item) {
              if (item.UII === oData.UII) {
                item.Quntity += 1;
                return true;
              }
              return false;
            })
          ) {
            aData.push({
              MaterialNumber: oData.MaterialNumber,
              UII: oData.UII,
              Quntity: 1,
            });
          }
          this.oModel.setProperty('/data', aData);
        } else {
          this.showMessage(this._oi18n.getText('EmptyValueScanned'));
        }
        this.checkSync();
      },

      decodeBarCode: function(sValue) {
        var oRes = {
          MaterialNumber: '',
          UII: '',
        };
        if (sValue) {
          oRes.MaterialNumber = sValue.slice(0, 8);
          oRes.UII = sValue.slice(12);
        }
        return oRes;
      },
    });
  }
);
