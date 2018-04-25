/*
TODO: Automate performance testing
https://www.npmjs.com/package/gulp-sitespeedio
https://www.npmjs.com/package/gulp-webpagetest
https://seesparkbox.com/foundry/automating_performance_testing_with_gulp
Good article about performance: https://css-tricks.com/the-critical-request/
*/

const gulp = require('gulp');
const pump = require('pump');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const gulpStylelint = require('gulp-stylelint');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const del = require('del');
const rename = require('gulp-rename');
const gutil = require('gulp-util');
const critical = require('critical').stream;
const runSequence = require('run-sequence');

// Google Page Speed Insights
const psi = require('psi');
const SITE_TO_BENCHMARK = 'https://jadchaar.me';

gulp.task('sass-compile-build', (cb) => {
  pump([
    gulp.src('assets/scss/styles.scss'),
    gulpStylelint({
      failAfterError: false,
      reporters: [{
        formatter: 'string',
        console: true
      }]
    }),
    sass().on('error', sass.logError),
    autoprefixer({
      cascade: false
    }),
    cleanCSS({
      level: 2
    }, (output) => {
      if (output.errors.length) {
        gutil.log(output.errors); // a list of errors raised
      }
      if (output.warnings.length) {
        gutil.log(output.warnings); // a list of warnings raised
      }
    }),
    gulp.dest('assets/css')
  ], cb);
});

gulp.task('minify:html', (cb) => {
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

gulp.task('move:css', (cb) => {
  pump([
    gulp.src('assets/css/styles.css'),
    gulp.dest('build/assets/css')
  ], cb);
});

gulp.task('minify:favicons', (cb) => {
  pump([
    gulp.src('assets/img/favicons/*'),
    imagemin({
      verbose: true
    }),
    gulp.dest('build/assets/img/favicons')
  ], cb);
});

gulp.task('move:sprites', (cb) => {
  pump([
    gulp.src('assets/img/sprites.svg'), gulp.dest('build/assets/img')
  ], cb);
});

gulp.task('move:cname', (cb) => {
  pump([
    gulp.src('CNAME'), gulp.dest('build')
  ], cb);
});

gulp.task('move:hosting', (cb) => {
  pump([
    gulp.src('build/**'),
    gulp.dest('../../jadchaar.github.io')
  ], cb);
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

// Cleaning

gulp.task('clean:build', () => {
  return del('build/**').then(paths => {
    if (paths.length) {
      gutil.log('Deleted files and folders:\n', paths.join('\n'));
    }
  });
});

gulp.task('clean:post-build', () => {
  return del('index-critical.html').then(paths => {
    if (paths.length) {
      gutil.log('Deleted files and folders:\n', paths.join('\n'));
    }
  });
});

gulp.task('clean:hosting', () => {
  return del(['../../jadchaar.github.io/**', '!../../jadchaar.github.io'], {
    force: true
  }).then(paths => {
    if (paths.length) {
      gutil.log('Deleted files and folders:\n', paths.join('\n'));
    }
  });
});

// Google Page Speed Insights

gulp.task('psi:mobile', () => {
  return psi.output(SITE_TO_BENCHMARK, {
    nokey: 'true',
    strategy: 'mobile'
  }).then(() => {
    gutil.log('Mobile Page Insights Complete!');
  });
});

gulp.task('psi:desktop', () => {
  return psi.output(SITE_TO_BENCHMARK, {
    nokey: 'true',
    strategy: 'desktop'
  }).then(() => {
    gutil.log('Desktop Page Insights Complete!');
  });
});

gulp.task('benchmark', ['psi:mobile', 'psi:desktop']);
gulp.task('build', (callback) => runSequence('sass-compile-build', ['clean:build', 'insert-critical-css'], ['minify:html', 'move:css', 'minify:favicons', 'move:sprites', 'move:cname'], 'clean:post-build', callback));
