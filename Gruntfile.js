/*
    Base grunt script for build and deploy SAP UI5 Application
    version: 1.2
    1.1 - added ESLint, Server.js
    1.2 - added babel task and manage versions
    author: T-Systems RUS, Andrey Danilin (c)
*/
module.exports = function(grunt) {
  var process = require('process');
  var path = require('path');

  var oExtFunctions = require('./extFn');
  var oConfig = grunt.file.readJSON('gruntConfig.json');
  var oDeployConfig = grunt.file.readJSON('deployConfig.json');
  var oPkg = grunt.file.readJSON('package.json');
  var oServerInfo = {
    URL: '',
    Client: '',
  };
  var oDir = {
    src: 'webapp', // webapp - for app; src - for libs
    dest: 'dist',
    temp: 'temp',
    resourceDir: '<%= conf.ui5Path %>',
  };

  if (oDeployConfig) {
    let sSystem = oDeployConfig.WBRequest.slice(0, 3);
    if (sSystem) {
      oServerInfo.URL =
        oConfig.servers[sSystem].serverURL + ':' + oConfig.servers[sSystem].serverPort;
      oServerInfo.Client = oConfig.servers[sSystem].serverClient;
    }
  }

  grunt.initConfig({
    pkg: oPkg,
    conf: oConfig,
    depConf: oDeployConfig,
    server: oServerInfo,

    dir: oDir,

    // rename to dbg
    fnRename: function(dest, src) {
      // this.js -> this-dbg.js
      var destinationFilename = '';
      if (src.endsWith('.controller.js') > 0) {
        destinationFilename = dest + src.replace(/\.controller\.js$/, '-dbg.controller.js');
      } else {
        destinationFilename = dest + src.replace(/\.js$/, '-dbg.js');
      }
      return destinationFilename;
    },

    copy: {
      temp: {
        files: [
          {
            expand: true,
            cwd: '<%= dir.src %>',
            src: ['**/*.*', '!**/*.md'],
            dest: '<%= dir.temp %>/',
          },
        ],
      },
      dbg: {
        files: [
          {
            expand: true,
            cwd: '<%= dir.temp %>',
            src: ['**/*.*', '!libs/*.*'],
            dest: '<%= dir.temp %>/',
            rename: '<%= fnRename %>',
          },
        ],
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= dir.temp %>',
            src: ['**'],
            dest: '<%= dir.dest %>/',
          },
        ],
      },
      version: {
        files: [
          {
            expand: true,
            cwd: '<%= dir.src %>',
            src: ['version.json'],
            dest: '<%= dir.dest %>/',
          },
        ],
      },
      resourcesLib: {
        files: [
          {
            expand: true,
            cwd: '<%= dir.dest %>',
            src: ['**', '**/.*', '!**/*.md'],
            dest: '<%= dir.resourceDir %>/<%= conf.appIndex %>',
          },
        ],
      },
    },

    clean: {
      dist: '<%= dir.dest %>',
      temp: '<%= dir.temp %>',
    },

    openui5_preload: {
      components: {
        options: {
          resources: {
            cwd: '<%= dir.temp %>',
            prefix: '<%= conf.appIndex %>',
            src: ['**', '**/.*'],
          },
          dest: '<%= dir.temp %>',
          compatVersion: '1.52',
        },
        components: true,
      },
      library: {
        options: {
          resources: {
            cwd: '<%= dir.temp %>',
            prefix: '<%= conf.appIndex %>',
            src: ['**', '**/.*'],
          },
          dest: '<%= dir.temp %>',
          compatVersion: '1.52',
        },
        libraries: '<%= conf.appIndex %>',
      },
      application: {
        options: {
          resources: {
            cwd: '<%= dir.temp %>',
            prefix: '<%= conf.appIndex %>',
          },
          dest: '<%= dir.temp %>',
          compatVersion: '1.52',
        },
        components: '<%= conf.appIndex %>',
      },
    },

    cssmin: {
      temp: {
        files: [
          {
            expand: true,
            src: '**/*.css',
            dest: '<%= dir.temp %>/',
            cwd: '<%= dir.temp %>',
          },
        ],
      },
    },

    uglify: {
      temp: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        },
        files: [
          {
            expand: true,
            cwd: '<%= dir.temp %>',
            src: ['**/*.js', '!**/*preload.js', '!**/*-dbg*'],
            dest: '<%= dir.temp %>/',
          },
        ],
      },
    },

    babel: {
      options: {
        sourceMap: 'inline',
        presets: ['@babel/preset-env'],
      },
      temp: {
        files: [
          {
            expand: true, // Enable dynamic expansion.
            cwd: '<%= dir.temp %>/', // Src matches are relative to this path.
            src: ['**/*.js', '!**/*-dbg*', '!**/libs/*.*'],
            dest: '<%= dir.temp %>/', // Destination path prefix.
          },
        ],
      },
    },

    // Deploy based on gruntConfig.json file
    nwabap_ui5uploader: {
      options: {
        conn: {
          server: '<%= server.URL %>',
          client: '<%= server.Client %>',
          // useStrictSSL: false  // for GUS
        },
        auth: {
          user: '<%= depConf.user %>',
          pwd: '<%= depConf.pwd %>',
        },
      },
      application_deploy: {
        options: {
          ui5: {
            package: '<%= conf.abapPackage %>',
            bspcontainer: '<%= conf.BSPApp %>',
            bspcontainer_text: '<%= conf.BSPDesc %>',
            transportno: '<%= depConf.WBRequest %>',
            calc_appindex: true,
          },
          resources: {
            cwd: '<%= dir.dest %>',
            src: '**/*.*',
          },
        },
      },
    },

    addVersion: {
      options: {
        src: '<%= dir.src %>',
        user: '<%= depConf.user %>',
        TR: '<%= depConf.WBRequest %>',
      },
      dev: {
        type: 'D',
        note: 'Develop version (not stable)',
      },
      prod: {
        type: 'P',
        note: 'Productive version (stable)',
        tag: true,
        tagMessage: 'Version transfered to PRD',
      },
      maint: {
        type: 'M',
        note: 'Maintenance version (test ready)',
      },
    },

    gittag: {
      addtag: {
        options: {
          tag: '', // will be setted by prev task
          message: '', // will be setted by prev task
        },
      },
    },

    gitlog: {
      getCommit: {
        options: {
          prop: 'gitlog.getCommit.result',
          number: 1,
        },
      },
    },
  });

  // Load requered tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-openui5');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-nwabap-ui5uploader');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-git');

  // User tasks
  grunt.registerTask('createResourcesJson', 'Create Resources.json file', function() {
    grunt.log.writeln('starting running createResourcesJson');
    oExtFunctions.createResourceJson(path.join(process.cwd(), oDir.dest));
    grunt.log.writeln('finish running createResourcesJson');
  });

  grunt.registerTask(
    'createsCachebusterInfoJson',
    'Create sap-ui-cachebuster-info.json file',
    function() {
      grunt.log.writeln('starting running createCachebusterInfoJson');
      oExtFunctions.createCachebusterInfoJson(path.join(process.cwd(), oDir.dest));
      grunt.log.writeln('finish running createCachebusterInfoJson');
    }
  );

  grunt.registerMultiTask('addVersion', 'Create new version of app', function() {
    grunt.config.requires('addVersion.options');
    grunt.config.requires('addVersion.' + this.target);
    grunt.log.writeln('starting running versionAdd:' + this.target);
    var aResults = grunt.config.get('gitlog.getCommit.result');
    var sVersion = oExtFunctions.addVersion(
      grunt,
      grunt.config('addVersion.options.src'),
      this.data.type || null,
      grunt.config('addVersion.options.TR'),
      grunt.config('addVersion.options.user'),
      this.data.note || '',
      aResults && aResults.length ? aResults[0].hash : ''
    );
    grunt.log.writeln('finish running versionAdd');
    if (this.data.tag) {
      grunt.log.writeln('starting running gitTag');
      grunt.config.set('gittag.addtag.options.tag', sVersion);
      grunt.config.set('gittag.addtag.options.message', this.data.tagMessage);
      grunt.task.run('gitTagByDeploy');
      grunt.log.writeln('finish running gitTag');
    }
  });

  grunt.registerTask('gitTagByDeploy', ['gittag:addtag']);

  grunt.registerTask('versiond', ['gitlog', 'addVersion:dev', 'copy:version']);
  grunt.registerTask('versionp', ['gitlog', 'addVersion:prod', 'copy:version']);
  grunt.registerTask('versionm', ['gitlog', 'addVersion:maint', 'copy:version']);

  grunt.registerTask('build', [
    'clean',
    'copy:temp',
    'copy:dbg',
    'openui5_preload:application', // for apps
    /* for libs
    'openui5_preload:components',
    'openui5_preload:library',
    */
    'uglify:temp',
    'cssmin:temp',
    'copy:dist',
    'createResourcesJson',
    'createsCachebusterInfoJson',
    'clean:temp',
  ]);

  grunt.registerTask('buildb', [
    'clean',
    'copy:temp',
    'copy:dbg',
    'babel:temp',
    'openui5_preload:application', // for apps
    /* for libs
    'openui5_preload:components',
    'openui5_preload:library',
    */
    'uglify:temp',
    'cssmin:temp',
    'copy:dist',
    'createResourcesJson',
    'createsCachebusterInfoJson',
    'clean:temp',
  ]);

  grunt.registerTask('deploy', ['nwabap_ui5uploader']);
  grunt.registerTask('deployd', ['versiond', 'nwabap_ui5uploader']);
  grunt.registerTask('deployp', ['versionp', 'nwabap_ui5uploader']);
  grunt.registerTask('deploym', ['versionm', 'nwabap_ui5uploader']);

  grunt.registerTask('copyToResources', ['copy:resourcesLib']);

  // default task
  grunt.registerTask('default', ['build']);
};
