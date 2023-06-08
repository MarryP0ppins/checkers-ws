// Dependencies
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');

// Task
gulp.task('default', function () {
    // listen for changes
    livereload.listen();
    // configure nodemon
    nodemon({
        // the script to run the app
        script: 'app.js',
        ext: 'js',
    }).on('restart', function () {
        // when the app has restarted, run livereload.
        gulp.src('app.js').pipe(livereload())
        console.log('Reloading serve, please wait...')
    });
});
