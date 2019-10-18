sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/m/MessageToast',
    'sap/m/Dialog',
    'sap/m/Button',
    'sap/m/Text',
    'sap/m/Label',
    'sap/m/Input',
    'pslint/exp/model/formatter',
  ],
  function(Controller, MessageToast, Dialog, Button, Text, Label, Input, formatter) {
    'use strict';

    return Controller.extend('pslint.exp.controller.BaseController', {
      formatter: formatter,
      _arguments: null,
      _oi18n: null,
      _oODataModel: null,

      /**
       * Convenience method for accessing the router.
       * @public
       * @returns {sap.ui.core.routing.Router} the router for this component
       */
      getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
      },

      /**
       * Convenience method for getting the view model by name.
       * @public
       * @param {string} [sName] the model name
       * @returns {sap.ui.model.Model} the model instance
       */
      getModel: function(sName) {
        return this.getView().getModel(sName);
      },

      /**
       * Convenience method for setting the view model.
       * @public
       * @param {sap.ui.model.Model} oModel the model instance
       * @param {string} sName the model name
       * @returns {sap.ui.mvc.View} the view instance
       */
      setModel: function(oModel, sName) {
        return this.getView().setModel(oModel, sName);
      },
      /**
       * Getter for the resource bundle.
       * @public
       * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
       */
      getResourceBundle: function() {
        return this.getOwnerComponent()
          .getModel('i18n')
          .getResourceBundle();
      },

      /**
       * Navigate to page
       * @public
       * @param {string} target: page name
       * @param {Object} settings
       * @param {Boolean} replace history or not (default: true)
       * @returns null
       */
      goToPage: function(pageName, oParams, bReplace) {
        if (typeof bReplace === 'undefined') {
          bReplace = true;
        }
        this.oRouter.navTo(pageName, oParams, bReplace);
      },

      /** Show message toast with predefined parameters
       * @public
       * @param {string} sText
       * @param {Object} oParams optional
       * @returns null
       */
      showMessage: function(sText, oParams) {
        oParams = oParams || {
          duration: 2000,
          closeOnBrowserNavigation: false,
          animationDuration: 500,
        };
        MessageToast.show(sText, oParams);
      },
      /*
       * Global busy indicator
       */
      hideBusyIndicator: function() {
        sap.ui.core.BusyIndicator.hide();
      },

      showBusyIndicator: function(iDelay) {
        sap.ui.core.BusyIndicator.show(iDelay);
      },

      // message = { Text: '', Type: 'E' }
      addMessagesToModel: function(aMessages, sDesc) {
        var oMessageManager = this.getOwnerComponent().getMessageManager();
        var oMessageModel = oMessageManager.getMessageModel();
        var aData = oMessageModel.getData();
        var aLog = [];
        aMessages.forEach(function(oMessage) {
          var sType = '';
          switch (oMessage.Type) {
            case 'E':
              sType = sap.ui.core.MessageType.Error;
              break;
            case 'S':
              sType = sap.ui.core.MessageType.Success;
              break;
            case 'W':
              sType = sap.ui.core.MessageType.Warning;
              break;
            default:
              sType = sap.ui.core.MessageType.Information;
          }
          // delete duplicate
          aLog.push(
            new sap.ui.core.message.Message({
              message: oMessage.Text,
              type: sType,
              description: new Date().toLocaleString() + ': ' + sDesc,
            })
          );
          aData = aData.filter(function(message) {
            if (
              (message.getMessage() !== oMessage.Text &&
                message.getMessage() + '.' !== oMessage.Text &&
                oMessage.Text + '.' !== message.getMessage()) || // Magic - two message from backend...
              (message.getDescription() && message.getDescription() !== sDesc)
            ) {
              return true;
            }
            return false;
          });
        });
        aData.forEach(function(item) {
          aLog.push(item);
        });
        oMessageManager.removeAllMessages();
        oMessageManager.addMessages(aLog);
      },

      onDetailMessages: function(oEvent) {
        var oMP = this.getOwnerComponent().getMessagePopover();
        oMP.toggle(oEvent.getSource());
        oMP.invalidate(); // by first time it can be problem..
      },
    });
  }
);
