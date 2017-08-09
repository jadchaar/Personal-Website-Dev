const gulp = require('gulp');
const pump = require('pump');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const bump = require('gulp-bump');
const del = require('del');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const gutil = require('gulp-util');
const critical = require('critical').stream;

// Google Page Speed Insights
const psi = require('psi');
const SITE_TO_BENCHMARK = 'https://jadchaar.me';

gulp.task('sass-compile', (cb) => {
  pump([
    gulp.src('assets/sass/styles.scss'),
    sass().on('error', sass.logError),
    cleanCSS((output) => {
      if (output.errors.length) {
        console.log(output.errors); // a list of errors raised
      }
      if (output.warnings.length) {
        console.log(output.warnings); // a list of warnings raised
      }
    }),
    gulp.dest('assets/css')
  ], cb);
});

gulp.task('sass:watch', () => {
  gulp.watch('assets/sass/styles.scss', ['sass-compile']);
});

gulp.task('minify-critical-html', (cb) => {
  pump([
    gulp.src('index-critical.html'),
    htmlmin({collapseWhitespace: true, conservativeCollapse: true, minifyCSS: true, minifyJS: true, removeComments: true}),
    rename({basename: 'index'}),
    gulp.dest('build')
  ], cb);
});

gulp.task('move-css', (cb) => {
  pump([
    gulp.src('assets/css/styles.css'),
    cleanCSS((output) => {
      if (output.errors.length) {
        console.log(output.errors); // a list of errors raised
      }
      if (output.warnings.length) {
        console.log(output.warnings); // a list of warnings raised
      }
    }),
    gulp.dest('build/assets/css')
  ], cb);
});

gulp.task('move-img', (cb) => {
  pump([
    gulp.src('assets/img/**/*'), gulp.dest('build/assets/img')
  ], cb);
});

gulp.task('move-cname', (cb) => {
  pump([
    gulp.src('CNAME'), gulp.dest('build')
  ], cb);
});

gulp.task('add-loadCSS', (cb) => {
  pump([
    gulp.src('index.html'), gulp.dest('build')
  ], cb);
});

gulp.task('minify-loadCSS', (cb) => {
  pump([
    gulp.src(['!assets/js/*.min.js', 'assets/js/*.js']),
    uglify(),
    rename({extname: '.min.js'}),
    gulp.dest('assets/js')
  ], cb);
});

gulp.task('clean:build', () => {
  del('build');
});

// gulp.task('minify-images-build', (cb) => {
//   pump([
//     gulp.src('img/*'),
// imagemin({verbose: true}),
//     gulp.dest('build/img')
//   ], cb);
// });

gulp.task('insert-critical-css', (cb) => {
  pump([
    gulp.src('index.html'),
    critical({inline: true, base: './', css: ['./assets/css/styles.css'], dest: 'index-critical.html', minify: true}).on('error', (err) => {
      gutil.log(gutil.colors.red(err.message));
    }),
    gulp.dest('build/')
  ], cb);
});

// Google Page Speed Insights

gulp.task('psi-mobile', () => {
  psi.output(SITE_TO_BENCHMARK, {
    nokey: 'true',
    strategy: 'mobile'
  }).then(() => {
    console.log('done');
  });
});

gulp.task('psi-desktop', () => {
  psi.output(SITE_TO_BENCHMARK, {
    nokey: 'true',
    strategy: 'desktop'
  }).then(() => {
    console.log('done');
  });
});

gulp.task('default', ['sass-compile', 'sass:watch']);
gulp.task('build', ['minify-critical-html', 'move-css', 'move-img', 'move-cname']);
gulp.task('clean', ['clean:build']);
gulp.task('minify', ['minify-loadCSS']);
gulp.task('critical', ['insert-critical-css']);
gulp.task('build-prep', ['clean:build', 'insert-critical-css']);
gulp.task('benchmark', ['psi-mobile', 'psi-desktop']);
