var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('dev-concat', function() {
    return gulp.src(['./src/dev/config.js', './src/!(main)*.js', './src/main.js'])
        .pipe(concat('sitepeek.js'))
        .pipe(gulp.dest('./build/dev'));
});

gulp.task('dev-build', ['dev-concat'], function() {
    return gulp.src(['./src/cursor.png', './src/sitepeek.css'])
        .pipe(gulp.dest('./build/dev'));
});

gulp.task('prod-concat', function() {
    return gulp.src(['./src/prod/config.js', './src/*.js', './src/main.js'])
        .pipe(concat('sitepeek.js'))
        .pipe(gulp.dest('./build/prod'));
});

gulp.task('prod-build', ['prod-concat'], function() {
    return gulp.src(['./src/cursor.png', './src/sitepeek.css'])
        .pipe(gulp.dest('./build/prod'));
});

gulp.task('default', ['dev-publish', 'prod-publish'], function() {
    return gulp.watch(['./src/**/*'], ['dev-publish', 'prod-publish']);
});