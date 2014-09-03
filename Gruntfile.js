module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    cssmin: {
      my_target: {
        files: [{
          expand: true,
          src: ['*.css', '!*.min.css'],
          ext: '.min.css'
        }]
      }
    },
    uglify: {
      my_target: {
        files: {
          'main.min.js': 'main.js' 
        }
      }
    } 
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['cssmin', 'uglify']);

};
