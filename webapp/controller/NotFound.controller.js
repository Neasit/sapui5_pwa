sap.ui.define(['pslint/exp/controller/BaseController'], function(BaseController) {
  'use strict';

  return BaseController.extend('pslint.exp.controller.NotFound', {
    /**
     * Navigates to the masterPR when the link is pressed
     * @public
     */
    onLinkPressed: function() {
      this.getRouter().navTo('StartPage');
    },
  });
});
