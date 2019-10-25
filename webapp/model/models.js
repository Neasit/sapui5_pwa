sap.ui.define(['sap/ui/model/json/JSONModel', 'sap/ui/Device'], function(JSONModel, Device) {
  'use strict';

  return {
    createDeviceModel: function() {
      var oModel = new JSONModel(Device);
      oModel.setDefaultBindingMode('OneWay');
      return oModel;
    },

    createLocalModel: function(oStore, sKey) {
      var oData = {
        data: [],
        syncActive: false,
      };
      if (oStore) {
        var sList = oStore.get(sKey);
        if (sList) {
          oData.data = JSON.parse(sList);
        }
      }
      return new JSONModel(oData);
    },
  };
});
