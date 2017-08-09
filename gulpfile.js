const gulp = require('gulp');
const pump = require('pump');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const bump = require('gulp-bump');

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

gulp.task('minify-html', (cb) => {
  pump([
    gulp.src('index.html'),
    htmlmin({collapseWhitespace: true, conservativeCollapse: true, minifyCSS: true, minifyJS: true, removeComments: true}),
    gulp.dest('build')
  ], cb);
});

gulp.task('move-css', (cb) => {
  pump([
    gulp.src('assets/css/styles.css'),
    gulp.dest('build/assets/css')
  ], cb);
});

gulp.task('move-img', (cb) => {
  pump([
    gulp.src('assets/img/*', '!assets/img/profile_picture_1000x1000.jpg'),
    gulp.dest('build/assets/img')
  ], cb);
});

gulp.task('move-cname', (cb) => {
  pump([
    gulp.src('CNAME'),
    gulp.dest('build')
  ], cb);
});

// gulp.task('minify-images-build', (cb) => {
//   pump([
//     gulp.src('img/*'),
//     imagemin({verbose: true}),
//     gulp.dest('build/img')
//   ], cb);
// });

gulp.task('default', ['sass-compile', 'sass:watch']);
gulp.task('build', ['minify-html', 'move-css', 'move-img', 'move-cname']);
