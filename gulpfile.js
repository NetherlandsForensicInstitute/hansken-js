const babel = require('gulp-babel'),
    browserify = require('browserify'),
    buffer = require('vinyl-buffer'),
    clean = require('gulp-dest-clean'),
    gulp = require('gulp')
    requirejs = require('gulp-requirejs'),
    source = require('vinyl-source-stream');

gulp.task('clean-build', () => {
    return gulp.src('src/*.js', {read: false})
        .pipe(clean('build'));
});

gulp.task('es6-commonjs', gulp.series('clean-build', () => {
    return gulp.src(['src/*.js', 'src/**/*.js'])
        .pipe(babel({
            presets: [
                ['@babel/preset-env', {
                    modules: 'commonjs'
                }]
            ]
        }))
        .pipe(gulp.dest('build/commonjs'));
}));

gulp.task('es6-amd', gulp.series('clean-build', () => {
    return gulp.src(['src/*.js', 'src/**/*.js'])
        .pipe(babel({
            presets: [
                ['@babel/preset-env', {
                    modules: 'amd'
                }]
            ]
        }))
        .pipe(gulp.dest('build/amd'));

}));

gulp.task('clean-dist-commonjs', () => {
    return gulp.src('src/*.js', {read: false})
        .pipe(clean('dist/commonjs'));
});
gulp.task('clean-dist-amd', () => {
    return gulp.src('src/*.js', {read: false})
        .pipe(clean('dist/amd'));

});

gulp.task('bundle-commonjs', gulp.series('clean-dist-commonjs', 'es6-commonjs', () => {
    return browserify('build/commonjs/hansken-js.js')
        .bundle()
        .pipe(source('hansken-js.js'))
        .pipe(buffer())
        .pipe(gulp.dest('dist/commonjs'));
}));
gulp.task('bundle-amd', gulp.series('clean-dist-amd', 'es6-amd', () => {
    return requirejs({
            name: 'hansken-js',
            baseUrl: 'build/amd',
            out: 'hansken-js.js'
        })
        .pipe(gulp.dest('dist/amd'));
}));

gulp.task('default', gulp.series('bundle-commonjs', 'bundle-amd'));
