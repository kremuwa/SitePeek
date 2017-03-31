var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('dev-concat', function() {
    return gulp.src(['./src/config-dev.js', './src/main.js'])
        .pipe(concat('sitepeek.js'))
        .pipe(gulp.dest('./build/dev'));
});

gulp.task('dev-build', ['dev-concat'], function() {
    return gulp.src(['./src/cursor.png', './src/sitepeek.css'])
        .pipe(gulp.dest('./build/dev'));
});

gulp.task('dev-publish', ['dev-build'], function() {
    return gulp.src('./build/dev/*')
        .pipe(gulp.dest('./../public_html/hosted-library'));
});

gulp.task('prod-concat', function() {
    return gulp.src(['./src/config-prod.js', './src/main.js'])
        .pipe(concat('sitepeek.js'))
        .pipe(gulp.dest('./build/prod'));
});

gulp.task('prod-build', ['prod-concat'], function() {
    return gulp.src(['./src/cursor.png', './src/sitepeek.css'])
        .pipe(gulp.dest('./build/prod'));
});

gulp.task('prod-publish', ['prod-build'], function() {
    return gulp.src('./build/prod/*')
        .pipe(gulp.dest('./../public_html/hosted-library'));
});

gulp.task('dev-watch', ['dev-publish', 'prod-build'], function() {
    return gulp.watch(['./src*'], ['dev-publish', 'prod-build']);
});