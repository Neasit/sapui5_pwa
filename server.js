/*
    Simple web server for testing web app
    author: T-Systems RUS, Andrey Danilin (c)
*/
var express = require('express');
var serveStatic = require('serve-static');
var proxy = require('http-proxy-middleware');
var fs = require('fs');
var oConfig = JSON.parse(fs.readFileSync('gruntConfig.json', 'utf8'));
var oDeployConfig;
if (fs.existsSync('deployConfig.json')) {
  oDeployConfig = JSON.parse(fs.readFileSync('deployConfig.json', 'utf8'));
}
var app = express();
var sSystem = 'XPF';
var sServerURL;
const port = 3050;

if (oConfig) {
  if (oDeployConfig && oDeployConfig.WBRequest) {
    sSystem = oDeployConfig.WBRequest.slice(0, 3);
  }
  if (oConfig.servers && oConfig.servers.length && oConfig.servers[sSystem]) {
    sServerURL = oConfig.servers[sSystem].serverURL;
  }
  app.use(serveStatic('./dist/'));
  // app.use('/resources/' + oConfig.appIndex, serveStatic('./src/', { fallthrough: false })); - for libs
  app.use('/resources', serveStatic(oConfig.ui5Path));
  if (sServerURL) {
    app.use(
      '/sap',
      proxy({
        target: sServerURL,
        changeOrigin: true,
        auth: oDeployConfig.user + ':' + oDeployConfig.pwd,
        onProxyRes: function(proxyRes) {
          var sPath = 'path=/';
          if (proxyRes.headers['set-cookie'] instanceof Array) {
            proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(function(sValue) {
              if (sValue.indexOf('SAP_SESSIONID') !== -1) {
                // Hook - cookie have to store in browser
                var oTemp = sValue.split(';');
                oTemp.some(function(str) {
                  if (str.indexOf('SAP_SESSIONID') !== -1) {
                    sValue = str + '; ' + sPath;
                    console.log('Session Id (cookie): ' + sValue);
                    return true;
                  }
                  return false;
                });
                /*
              sValue = sValue.slice(0, sValue.indexOf('; secure; HttpOnly'));
              var sTemp = sValue.split(';')[0];
              var oTemp = sTemp.split('=');
              oSAPId.name = oTemp[0];
              oSAPId.value = oTemp[1];
              sValue = sValue.slice(0, -18);
              */
              }
              return sValue;
            });
          }
        },
      })
    );
  }
  app.listen(port);
  console.log('Server run on: localhost: ' + port);
} else {
  console.log('Config file not found or empty! Check: gruntConfig.json');
}
