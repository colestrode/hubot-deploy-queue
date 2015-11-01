

module.exports = function(grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  require('time-grunt')(grunt);

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
    }
  });

  grunt.registerTask('lint', [
    'jshint',
    'jscs'
  ]);

  grunt.registerTask('test', ['lint']);
};
