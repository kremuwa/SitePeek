var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify');

gulp.task('dev-concat', function() {
    return gulp.src(['./src/dev/config.js', './src/!(main)*.js', './src/main.js'])
        .pipe(concat('sitepeek.js'))
        .pipe(gulp.dest('./build/dev'));
});

gulp.task('dev-minify', function() {
    return gulp.src('./build/dev/sitepeek.js')
        .pipe(minify({
            ext: {
                min: '.min.js'
            }
        }))
        .pipe(gulp.dest('./build/dev'));
});

gulp.task('dev-build', ['dev-concat', 'dev-minify'], function() {
    return true;
});

gulp.task('prod-concat', function() {
    return gulp.src(['./src/prod/config.js', './src/!(main)*.js', './src/main.js'])
        .pipe(concat('sitepeek.js'))
        .pipe(gulp.dest('./build/prod'));
});

gulp.task('prod-minify', function() {
    return gulp.src('./build/prod/sitepeek.js')
        .pipe(minify({
            ext: {
                min: '.min.js'
            }
        }))
        .pipe(gulp.dest('./build/prod'));
});

gulp.task('prod-build', ['prod-concat', 'prod-minify'], function() {
    return true;
});

gulp.task('publish-cursor', function() {
    return gulp.src('./src/cursor.png')
        .pipe(gulp.dest('../public_html/img'));
});

gulp.task('default', ['dev-build', 'prod-build', 'publish-cursor'], function() {
    return gulp.watch(['./src/**/*'], ['dev-build', 'prod-build']);
});