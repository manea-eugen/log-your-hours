var gulp = require('gulp'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    runSequence = require('run-sequence'),
    include = require('gulp-include'),
    del = require('del'),
    browserSync = require('browser-sync').create(),
    nodemon = require('gulp-nodemon')
;


gulp.task('js', function () {
    return gulp.src('source/js/all.js')
        .pipe(include())
        .pipe(concat('public/js/all.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('sass', function () {
    gulp.src('source/sass/all.scss')
        .pipe(sass())
        .pipe(concat('public/css/all.css'))
        .pipe(browserSync.stream())
        .pipe(gulp.dest('./'));
});

/** run watch **/
gulp.task('watch', function () {
    gulp.watch('source/js/**/*.js', ['js']).on('change', browserSync.reload);
    gulp.watch('source/sass/**/*.scss', ['sass'])//.on('change', browserSync.reload);
});


gulp.task('default', ['watch','js', 'sass', 'browser-sync']);

gulp.task('browser-sync', ['nodemon'], function() {
    console.log(browserSync);
    browserSync.init(null, {
        proxy: "http://localhost:5000",
        // files: ["public/**/*.*"],
        port: 7000,
    });
});

gulp.task('nodemon', function (cb) {

    var started = false;

    return nodemon({
        script: './bin/www'
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if (!started) {
            cb();
            started = true;
        }
    });
});

