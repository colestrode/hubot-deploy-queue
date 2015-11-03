

module.exports = function(grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  require('time-grunt')(grunt);
  grunt.option('reporter', grunt.option('reporter') || 'spec');

  grunt.initConfig({
    jscs: {
      src: [
        'resources/**/*.js',
        'lib/**/*.js',
        'test/func/**/*.js',
        'test/unit/**/*.js',
        '*.js'
      ]
    },
    jshint: {
      files: [
        'test/unit',
        'test/func',
        'resources',
        'lib',
        '*.js'
      ],
      options: {
        jshintrc: './.jshintrc',
        ignores: ['Gruntfile.js']
      }
    },
    shell: {
      test: {
        command: './node_modules/.bin/istanbul cover --report lcov --dir test/reports/  ./node_modules/.bin/_mocha --recursive ./test/ -- --colors --reporter <%= grunt.option("reporter") %> <%= grunt.option("bail") && " --bail" %>',
        options: {
          stdout: true,
          failOnError: true
        }
      }
    }
  });

  grunt.registerTask('lint', [
    'jshint',
    'jscs'
  ]);

  grunt.registerTask('test', ['lint', 'shell:test']);
};
