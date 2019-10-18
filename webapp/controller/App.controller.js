sap.ui.define(['pslint/exp/controller/BaseController'], function(BaseController) {
  'use strict';

  return BaseController.extend('pslint.exp.controller.App', {
    onInit: function() {
      var oViewModel = new sap.ui.model.json.JSONModel({
        busy: false,
        delay: 0,
      });
      this.setModel(oViewModel, 'appModel');
    },
  });
});