(function(sap) {
  /**
   * Registers the module paths for dependencies of the given component.
   * It fetches the app-index of the component, checks its dependencies
   * and finally registers the module paths via "jQuery.sap.registerModulePath"
   * if an explicit url is defined for a dependency. Make sure the ICF service
   * "/sap/bc/ui2/app_index" is active in your SAP system.
   *
   * @param {string} componentId The id of the component, e.g. "my.custom.app"
   * for which the dependencies should be registered.
   * @returns {Promise} A promise which is resolved when the ajax request for
   * the app-index was successful and the module paths were registered. In case
   * the app-index could not be fetched for the given component, the promise is
   * rejected.
   */
  sap.registerComponentDependencyPaths = function(componentId) {
    var url = '/sap/bc/ui2/app_index/ui5_app_info?id=' + componentId;

    return new Promise(function(resolve, reject) {
      $.ajax(url)
        .done(function(data) {
          if (data && data[componentId]) {
            var moduleDefinition = data[componentId];
            moduleDefinition.dependencies.forEach(function(dependency) {
              if (dependency.url) {
                jQuery.sap.registerModulePath(dependency.componentId, dependency.url);
              }
            });
          } else {
            reject(new Error("No app info found for component '" + componentId + "'."));
          }

          resolve();
        })
        .fail(function(error) {
          reject(
            new Error(
              "Could not fetch app info for component '" +
                componentId +
                "'. " +
                'No module paths were registered for dependent libraries.'
            )
          );
        });
    });
  };
})(sap);
