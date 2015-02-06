var gulp = require('gulp');
var revall = require('gulp-rev-all');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var concat = require('gulp-concat');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');   
var useref = require('gulp-useref');
var filter = require('gulp-filter');
var csso = require('gulp-csso');
var del = require('del');

// Images
gulp.task('images', function() {
  return gulp.src('./static/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('./build/images'));
});

gulp.task('copycss', function() {
  return gulp.src('./static/css/*.css')
      .pipe(gulp.dest('./build/css'));
});


gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build', 'release'], cb);
});


//1. concat all js, css and minify
gulp.task('usemin', [], function() {
  gulp.src(['./static/home.html'])
    .pipe(usemin({
      js: [uglify()],
      js1: [uglify()],
      js2: [uglify()]
    }))
    .pipe(gulp.dest('./build'));
});

//2. revall

gulp.task('revall', ['images', 'copycss', 'usemin'], function(){
	gulp.src('./build/**/*')
		.pipe(revall({ ignore: [/^\/favicon.ico$/g, /^\/home.html/g, /^\/iamalive.html/g ] }))
		//.pipe(minifyHtml({empty: true}))
		.pipe(gulp.dest('./release'));
});


// Default task
gulp.task('default', ['clean'], function() {
    //gulp.start('usemin', 'images', 'iphone4css', 'revall');
    gulp.start('revall');
});



