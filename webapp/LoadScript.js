'use strict';

var fLoadScript = function loadScript(url, params, callback) {
  // Adding the script tag to the head as suggested before
  var head = document.head;
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  script.async = true;
  if (params) {
    Object.keys(params).forEach(function(key) {
      script.setAttribute(key, params[key]);
    });
  }

  // Then bind the event to the callback function.
  // There are several events for cross browser compatibility.
  script.onreadystatechange = callback;
  script.onload = callback;

  // Fire the loading
  head.appendChild(script);
};
