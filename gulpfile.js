const babel = require('gulp-babel'),
    browserify = require('browserify'),
    buffer = require('vinyl-buffer'),
    clean = require('gulp-dest-clean'),
    gulp = require('gulp'),
    requirejs = require('gulp-requirejs'),
    source = require('vinyl-source-stream');

const cleanOutput = (target, modules) =>
    () => gulp.src('src/*.js', {read: false})
        .pipe(clean(`${target}/${modules}`));

const build = (modules) =>
    () => gulp.src('src/**/*.js')
        .pipe(babel({
            presets: [
                ['@babel/preset-env', {modules}]
            ]
        }))
        .pipe(gulp.dest(`build/${modules}`));

['amd', 'commonjs'].forEach(modules => {
    gulp.task(`clean-build:${modules}`, cleanOutput('build', modules));
    gulp.task(`es6:${modules}`, gulp.series(`clean-build:${modules}`, build(modules)));
    gulp.task(`clean-dist:${modules}`, cleanOutput('dist', modules));
});

gulp.task('bundle:commonjs', gulp.series(
    'clean-dist:commonjs',
    'es6:commonjs',
    () => browserify('build/commonjs/hansken-js.js')
        .bundle()
        .pipe(source('hansken-js.js'))
        .pipe(buffer())
        .pipe(gulp.dest('dist/commonjs'))
));

gulp.task('bundle:amd', gulp.series(
    'clean-dist:amd',
    'es6:amd',
    () => requirejs({
        name: 'hansken-js',
        baseUrl: 'build/amd',
        out: 'hansken-js.js'
    }).pipe(gulp.dest('dist/amd'))));

gulp.task('default', gulp.series('bundle:commonjs', 'bundle:amd'));
