/*
    Additional tasks for grunt
    author: T-Systems RUS, Andrey Danilin (c)
*/
'use strict';

var path = require('path');
var fs = require('fs');
var process = require('process');

/*
    Utils - help functions (copied from grunt-sapui5-bestpractice-build (1.3.64))
    create resource file ...
*/
module.exports = {

  // type = 'D' - develop, 'M' - maitenence, 'P' - production
  addVersion: function(grunt, src, type, TR, user, note, hash) {
    var fileName = 'version.json';
    var filePath = path.relative(process.cwd(), src) + '/' + fileName;
    var sData = '{}';
    if (fs.existsSync(filePath)) {
      sData = fs.readFileSync(filePath, { encoding: 'utf-8' });
    }
    var oVersion = JSON.parse(sData);
    var sSystem = TR ? TR.slice(0, 3) : 'CSP';
    var version = {
      major: 0,
      minor: 0,
      dev: 0,
    };
    if (oVersion.current) {
      oVersion.current.version.split('.').forEach(function(string, i) {
        switch (i) {
          case 0:
            version.major = parseInt(string);
            break;
          case 1:
            version.minor = parseInt(string);
            break;
          case 2:
            version.dev = parseInt(string);
            break;
          default:
            grunt.log.writeln('Invalide version in file');
        }
      });
      oVersion.history = oVersion.history || [];
      oVersion.history.push(oVersion.current);
    } else {
      oVersion.current = {};
      oVersion.history = [];
    }
    switch (type) {
      case 'D':
        version.dev += 1;
        break;
      case 'M':
        version.minor += 1;
        version.dev = 0;
        break;
      case 'P':
        version.major += 1;
        version.minor = 0;
        version.dev = 0;
        break;
      default:
        version.dev += 1;
    }
    var sNewVersion = [version.major, version.minor, version.dev].join('.');
    oVersion.current = {
      version: sNewVersion,
      user: user || 'unknown',
      system: sSystem || 'unknown',
      tr: TR || 'unknown',
      date: new Date(),
      note: note || 'empty',
      hash: hash,
    };
    fs.writeFileSync(filePath, JSON.stringify(oVersion));
    return sNewVersion;
  },

  cacheBusterInfoJsonResources: {},

  createCachebusterInfoJson: function(Path) {
    this.createSapUICacheBusterInfoJsonResource(Path);
    var jsonCachebusterContent = JSON.stringify(this.cacheBusterInfoJsonResources, null, 2);
    fs.writeFileSync(path.join(Path, 'sap-ui-cachebuster-info.json'), jsonCachebusterContent);
  },

  createSapUICacheBusterInfoJsonResource: function(curPath) {
    var relativePath = path.relative(process.cwd(), curPath);
    if (relativePath.indexOf('dist') >= 0) {
      relativePath = path.relative('dist', relativePath);
    }
    var files = fs.readdirSync(curPath);
    for (var i = 0; i < files.length; i++) {
      var fileName = files[i];
      var newPath = path.join(curPath, fileName);
      if (fs.lstatSync(newPath).isDirectory()) {
        if (fileName != 'dist' && fileName != 'node_modules')
          this.createSapUICacheBusterInfoJsonResource(newPath);
      } else {
        if (fileName != 'sap-ui-cachebuster-info.json') {
          var relatetiveFileName = path
            .normalize(path.join(relativePath, fileName))
            .replace(new RegExp('\\' + path.sep, 'g'), '/');
          var fileNameFull = path.normalize(path.join(curPath, fileName));
          var lastModifiedTime = fs.lstatSync(fileNameFull).mtime.getTime();
          this.cacheBusterInfoJsonResources[relatetiveFileName] = lastModifiedTime;
        }
      }
    }
  },

  resources: [],

  createResourceJson: function(Path) {
    var sJsonContent = {};
    var jsonContent;
    this.createResource(Path);
    sJsonContent.resources = this.resources;
    jsonContent = JSON.stringify(sJsonContent, null, 4);
    fs.writeFileSync(path.join(Path, 'resources.json'), jsonContent);
  },

  createResource: function(curPath) {
    var relativePath = path.relative(process.cwd(), curPath);
    if (relativePath.indexOf('dist') >= 0) {
      relativePath = path.relative('dist', relativePath);
    }
    var files = fs.readdirSync(curPath);
    for (var i = 0; i < files.length; i++) {
      var resource = {};
      var fileName = files[i];
      var sSuffix = path.extname(path.join(curPath, fileName));
      resource.name = path.normalize(path.join(relativePath, fileName));

      if (fileName === 'Component-preload.js' || fileName === 'resources.json') {
        resource.merged = true;
      }
      if (sSuffix === '.properties' && fileName.indexOf('i18n') > -1) {
        resource.raw = path.join('i18n', 'i18n.properties');
      } else if (sSuffix === '.properties' && fileName.indexOf('messageBundle') > -1) {
        resource.raw = 'messageBundle.properties';
      }
      if (resource.raw) {
        var start = fileName.indexOf('_');
        var end = fileName.indexOf('.properties');
        if (start > -1 && end > -1) resource.locale = fileName.substring(start, end);
      }
      if (fileName.indexOf('-dbg') > 0) {
        resource.isDebug = true;
      }
      var newPath = path.join(curPath, fileName);
      if (fileName != 'dist' && fileName != 'node_modules' && fs.lstatSync(newPath).isDirectory()) {
        var foundPath = this.createResource(newPath);
      } else {
        this.resources.push(resource);
      }
    }
  },
};
