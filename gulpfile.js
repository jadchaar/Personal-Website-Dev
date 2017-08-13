const gulp = require('gulp');
const pump = require('pump');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const bump = require('gulp-bump');
const del = require('del');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const gutil = require('gulp-util');
const critical = require('critical').stream;
const sourcemaps = require('gulp-sourcemaps');

// Google Page Speed Insights
const psi = require('psi');
const SITE_TO_BENCHMARK = 'https://jadchaar.me';

gulp.task('sass-compile-dev', (cb) => {
  pump([
    gulp.src('assets/sass/styles.scss'),
    sourcemaps.init(),
    sass().on('error', sass.logError),
    autoprefixer({
      cascade: false
    }),
    cleanCSS((output) => {
      if (output.errors.length) {
        gutil.log(output.errors); // a list of errors raised
      }
      if (output.warnings.length) {
        gutil.log(output.warnings); // a list of warnings raised
      }
    }),
    sourcemaps.write('.'),
    gulp.dest('assets/css')
  ], cb);
});

gulp.task('sass-compile-build', (cb) => {
  pump([
    gulp.src('assets/sass/styles.scss'),
    sass().on('error', sass.logError),
    autoprefixer({
      cascade: false
    }),
    cleanCSS((output) => {
      if (output.errors.length) {
        gutil.log(output.errors); // a list of errors raised
      }
      if (output.warnings.length) {
        gutil.log(output.warnings); // a list of warnings raised
      }
    }),
    rename({
      basename: 'styles-build'
    }),
    gulp.dest('assets/css')
  ], cb);
});

gulp.task('sass:watch', () => {
  gulp.watch('assets/sass/styles.scss', ['sass-compile-dev']);
});

gulp.task('minify-html', (cb) => {
  pump([
    gulp.src('index-critical.html'),
    htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeEmptyElements: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true
    }),
    rename({
      basename: 'index'
    }),
    gulp.dest('build')
  ], cb);
});

gulp.task('move-css', (cb) => {
  pump([
    gulp.src('assets/css/styles-build.css'),
    rename({
      basename: 'styles'
    }),
    gulp.dest('build/assets/css')
  ], cb);
});

gulp.task('minify-favicons', (cb) => {
  pump([
    gulp.src('assets/img/favicons/*'),
    imagemin({
      verbose: true
    }),
    gulp.dest('build/assets/img/favicons')
  ], cb);
});

gulp.task('move-sprites', (cb) => {
  pump([
    gulp.src('assets/img/sprites.svg'), gulp.dest('build/assets/img')
  ], cb);
});

gulp.task('move-cname', (cb) => {
  pump([
    gulp.src('CNAME'), gulp.dest('build')
  ], cb);
});

gulp.task('minify-loadCSS', (cb) => {
  pump([
    gulp.src(['!assets/js/*.min.js', 'assets/js/*.js']),
    uglify(),
    rename({
      extname: '.min.js'
    }),
    gulp.dest('assets/js')
  ], cb);
});

gulp.task('clean:build', () => {
  del('build/**').then(paths => {
    if (paths.length) {
      gutil.log('Deleted files and folders:\n', paths.join('\n'));
    }
  });
});

gulp.task('clean:post-build', () => {
  del(['index-critical.html', 'assets/css/styles-build.css']).then(paths => {
    if (paths.length) {
      gutil.log('Deleted files and folders:\n', paths.join('\n'));
    }
  });
});

gulp.task('insert-critical-css', (cb) => {
  pump([
    gulp.src('index.html'),
    critical({
      inline: true,
      base: './',
      css: ['./assets/css/styles.css'],
      dest: 'index-critical.html',
      minify: true
    }).on('error', (err) => {
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
    gutil.log('Mobile Page Insights Complete!');
  });
});

gulp.task('psi-desktop', () => {
  psi.output(SITE_TO_BENCHMARK, {
    nokey: 'true',
    strategy: 'desktop'
  }).then(() => {
    gutil.log('Desktop Page Insights Complete!');
  });
});

gulp.task('default', ['sass-compile-dev', 'sass:watch']);
// gulp.task('compile:sass', ['sass-compile-build']);
gulp.task('build', ['minify-html', 'move-css', 'minify-favicons', 'move-sprites', 'move-cname']);
// gulp.task('clean', ['clean:build']);
// gulp.task('minify', ['minify-loadCSS']);
// gulp.task('critical', ['insert-critical-css']);
gulp.task('build-prep', ['clean:build', 'insert-critical-css']);
gulp.task('benchmark', ['psi-mobile', 'psi-desktop']);
