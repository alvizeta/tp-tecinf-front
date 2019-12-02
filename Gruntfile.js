'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var httpProxyMiddleware = function (connect, options) {
    var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
    return [
      // Include the proxy first
      proxy,
      // Serve static files.
      connect.static(options.base.toString()),
      // Make empty directories browsable.
      connect.directory(options.base.toString())
    ];
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    project: {
      // configurable paths
      src: 'src',
      dist: 'dist'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= project.src %>/app/**/*.js'],
        tasks: ['newer:jshint:all', 'karma']
      },
      jsTest: {
        files: ['test/**/*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      styles: {
        files: ['<%= project.src %>/css/{,*/}*.css'],
        tasks: ['newer:copy:styles']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    },

    // The actual grunt server settings
    connect: {
      server: {
        options: {
          port: 9000,
          // Change this to '0.0.0.0' to access the server from outside.
//          hostname: 'localhost',
          base:'<%= project.src %>',

          middleware: httpProxyMiddleware
        },

        // proxy to connect to backend http server
        proxies: [
            {
                context: ['/tec-inf-api'],
                host: 'localhost',
                port: '8080',
                headers: {
                  'host': 'localhost'
                },
                https: false,
                rewrite: {
                  '/': '/'
                },
                changeOrigin: true,
                xforward: true
            }
        ]



/********************************************************************************


 This Grunt file serves three main purposes:
  1. Provide a local http server for development and test purposes
  2. Run unit tests
  3. Generate optimized version of the app to be deployed in production environments

Provided high-level Tasks:

  * clean:  Clean previously generated temporary and output files
  * test:   Run unit tests once
  * build:  Build optimized version of app under dist/
  * serve:  Starts a local http server on port 9000 (and re-runs unit tests on modifications)
  * serve:dist  Builds optimized version of the app and serves it (off of dist/)
                on http server on port 9000,


 The build task processes all JS and CSS files declared in <!-- build ... endbuild --> sections
 of src/index.html.

 At a high-level:
    * It converts all our Angular html templates to a single ng-templates.js file
    * It concatenates all JS files into a single file
    * It runs ngmin on it, which tries to complete all Angular declarations to allow for
      minification (see http://www.thinkster.io/pick/XlWneEZCqY/angularjs-ngmin)
    * It runs "uglify", to minimize the size of the resulting JS file
    * It concatenates all CSS files into a single file
    * It runs "cssmin", to minimize the size of the resulting CSS file
    * It generates a random name for the final .js and .css files, to circunvent browser caches

 Note: The script does not process files from third-party libraries. This is on purpose,
 to allow browsers to cache them freely.

********************************************************************************/


      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= project.src %>'
          ]
        }
      },
      dist: {
        options: {
          port: 9000,
          base: '<%= project.dist %>',
          middleware: httpProxyMiddleware
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= project.src %>/app/**/*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= project.dist %>/*',
            '!<%= project.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= project.dist %>/app/**/*.js',
            '<%= project.dist %>/css/**/*.css',
            '<%= project.dist %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= project.dist %>/css/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= project.src %>/index.html',
      options: {
        dest: '<%= project.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= project.dist %>/{,*/}*.html'],
      css: ['<%= project.dist %>/css/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= project.dist %>']
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= project.dist %>',
          src: ['*.html' ],
          dest: '<%= project.dist %>'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/app',
          src: '**/*.js',
          dest: '.tmp/concat/app'
        }]
      }
    },

    ngtemplates:  {
      app: {
        cwd:      '<%= project.src %>',
        src:      '**/*.html',
        dest:     '.tmp/ng-templates.js',
        options:  {
          module:   'app', // angular module
          usemin: ( (process.platform === 'win32') ?
                    'app\\app-all.js' :
                    'app/app-all.js'), // This comes from the <!-- build:js --> block
          htmlmin:  {
            collapseBooleanAttributes:      true,
            collapseWhitespace:             true,
            removeAttributeQuotes:          true,
            removeComments:                 true, // Only if you don't use comment directives!
            removeEmptyAttributes:          true,
            removeRedundantAttributes:      true,
            removeScriptTypeAttributes:     true,
            removeStyleLinkTypeAttributes:  true

          } //'<%= htmlmin.dist %>'
        }
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= project.src %>',
          dest: '<%= project.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'images/{,*/}*.{webp}',
            'fonts/*',
            'WEB-INF/*'
          ]
        }, {
          expand: true,
          cwd: 'lib',
          dest: '<%= project.dist %>/lib',
          src: ['**/*']
        },
                {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= project.dist %>/images',
          src: ['generated/*']
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= project.src %>/css',
        dest: '.tmp/css/',
        src: '{,*/}*.css'
      }
    },

    // Unit Testing configuration
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    // Browser-level testing configuration
    protractor: {
      options: {
        configFile: 'protractor.conf.js', // Target-specific config file
        keepAlive: true // If false, the grunt process stops when the test fails.
        // debug: true
      },
      localhost: {
        options: {
          args: {
            baseUrl: 'http://localhost:5000'
          }
        }
      },
      dev: {
        options: {
          args: {
            baseUrl: 'http://example:5000'
          }
        }
      }
    }
  });


  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build',
                             'configureProxies:server',
                             'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'copy:styles',
      'configureProxies:server',
      'connect:server',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', [
    'clean:server',
    'copy:styles',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'copy:styles',
    'ngtemplates',
    'concat',
    'ngmin',
    'copy:dist',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    // 'newer:jshint',
    'test',
    'build'
  ]);
};
