/*global module:false*/
module.exports = function(grunt) {
    "use strict";

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! \n' +
        ' * <%= pkg.title || pkg.name %>\n' +
    ' * <%= pkg.description %>\n' +
    ' * @version <%= pkg.version %> \n' +
    ' * \n' +
    ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= _.map(pkg.authors, "name").join(", ") %> \n' +
    ' * @link <%= pkg.homepage %> \n' +
    ' * @license  <%= _.map(pkg.licenses, "type").join(", ") %> \n' +
    ' */ \n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['.tmp/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    clean: {
      dist: '.tmp'
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        sourceMap: 'dist/<%= pkg.name %>.map'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    ngtemplates: {
      main: {
        options: {
          module: '<%= pkg.name %>',
          prefix: '<%= pkg.name %>/',
          htmlmin: {
            collapseWhitespace: true,
            conservativeCollapse: true,
            collapseBooleanAttributes: true,
            removeCommentsFromCDATA: true,
            removeOptionalTags: true,
          }
        },
        cwd: 'src',
        src: ['**/*.html'],
        dest: '.tmp/templates.js'
      }
    },
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: 'src',
          src: ['**/*.js'],
          dest: '.tmp'
        }]
      }
    },
    less: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.css': 'src/**/*.less'
        }
      }
    },
    jshint: {
        options: {
            jshintrc: '.jshintrc',
            reporter: require('jshint-stylish')
        },
        all: {
            src: [
                'Gruntfile.js',
                'src/**/*.js'
            ]
        }
    },
      connect: {
          options: {
              port: 9900,
              // Change this to '0.0.0.0' to access the server from outside.
              hostname: 'localhost',
              livereload: 35711
          },
          dev: {
              options: {
                  middleware: function (connect) {
                      var serveStatic = require('serve-static');
                      return [
                          serveStatic('.tmp'),
                          connect().use(
                              '/bower_components',
                              serveStatic('./bower_components')
                          ),
                          connect().use(
                              '/dist',
                              serveStatic('./dist')
                          ),
                          serveStatic('demo')
                      ];
                  }
              }
          }
      },
    watch: {
      dev: {
        files: ['src/**/*.html', 'src/**/*.js'],
        tasks: ['default'],
          options: {
              livereload: '<%= connect.options.livereload %>'
          },
      },
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      }
    }
  });

  // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-angular-templates');

    grunt.registerTask('serve', ['default', 'connect', 'watch']);

  // Default task.
  grunt.registerTask('default', ['jshint', 'clean', 'ngtemplates', 'ngAnnotate', 'concat', 'uglify', 'less']);

};
