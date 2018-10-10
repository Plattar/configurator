var gulp = require('gulp');

var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var less = require('gulp-less');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var angularTemplatecache = require('gulp-angular-templatecache');
// var jshint = require('gulp-jshint');
var gulpif = require('gulp-if');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var connect = require('gulp-connect');
var rename = require("gulp-rename");

var env;

var scripts = [
  './src/app.js',
  './src/*.js',
  './src/**/*.js',
];

var styles = [
  './src/*.less',
  './src/**/*.less'
];

var index = [
  './src/index.html'
];

var views = [
  './src/*.html',
  './src/**/*.html',
  '!./src/index.html'
];

var svgs = [
  './src/*.svg',
  './src/**/*.svg'
];

var externalScripts = [
  'jquery/dist/jquery.js',
  'angular/angular.js',
  'popper.js/dist/umd/popper.js',
  'bootstrap/dist/js/bootstrap.js',
];

var externalStyles = [
  'bootstrap/dist/css/bootstrap.css'
];

/*gulp.task('lint', function(cb) {
  return gulp.src(scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
    // .pipe(jshint.reporter('fail'));
});*/

gulp.task('less', () => {
  var buildFolder  = './temp/';

  return gulp.src(styles)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(less({
      compress: true,
      strictMath: true
    }))
    .pipe(concat('local-styles.css'))
    .pipe(gulpif(env == 'dev', sourcemaps.write()))
    .pipe(gulp.dest(buildFolder));

    // Create manifest and and write to build folder
    /*.pipe(gulpif(env == 'prod', rev()))
    .pipe(gulpif(env == 'prod', rev.manifest('css-manifest.json')))
    .pipe(gulpif(env == 'prod', gulp.dest(buildFolder)));*/
});

gulp.task('localScripts', () => {
  var buildFolder = './temp/';

  return gulp.src(scripts)
    .pipe(plumber())

    .pipe(sourcemaps.init())
    .pipe(uglify({mangle:true}))
    // .pipe(gulpif(env == 'prod', uglify({mangle:true})))
    .pipe(concat('local-bundle.js'))
    .pipe(gulpif(env == 'dev', sourcemaps.write()))

    .pipe(gulp.dest(buildFolder))

    /*.pipe(gulpif(env == 'prod', rev()))
    .pipe(gulpif(env == 'prod', rev.manifest('js-manifest.json')))
    .pipe(gulpif(env == 'prod', gulp.dest(buildFolder)));*/
});

gulp.task('views', function (cb) {
  var buildFolder = './temp/';

  return gulp.src(views.concat(svgs))
    .pipe(plumber())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(angularTemplatecache({
      module: 'PlattarEmbed'
    }))
    .pipe(gulp.dest(buildFolder))
    /*.pipe(gulpif(env == 'prod',rev()))
    .pipe(gulpif(env == 'prod', rev.manifest('templates-manifest.json')))
    .pipe(gulpif(env == 'prod', gulp.dest(buildFolder)));*/
});

gulp.task('externalScripts', function () {
  var scripts = externalScripts.map(function(path){
    return './node_modules/' + path;
  });

  var buildFolder = './temp/';

  return gulp.src(scripts)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(gulpif(env == 'prod', uglify({})))
    .pipe(concat('external-bundle.js'))
    .pipe(gulpif(env == 'dev', sourcemaps.write()))

    .pipe(gulp.dest(buildFolder))

    /*.pipe(gulpif(env == 'prod',rev()))
    .pipe(gulpif(env == 'prod',rev.manifest('externaljs-manifest.json')))
    .pipe(gulpif(env == 'prod',gulp.dest(buildFolder)));*/
});

gulp.task('externalStyles', function (cb) {
  var styles = externalStyles.map(function(path){
    return './node_modules/' + path;
  });

  var buildFolder = './temp/';

  var stream = gulp.src(styles)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('external-styles.css'))
    .pipe(gulpif(env == 'dev', sourcemaps.write()))
    // .pipe(minifyCSS(opts))

    .pipe(gulp.dest(buildFolder))

    /*.pipe(gulpif(env == 'prod',rev()))
    .pipe(gulpif(env == 'prod', rev.manifest('externalcss-manifest.json')))
    .pipe(gulpif(env == 'prod', gulp.dest(buildFolder)));*/
  return stream;
});

gulp.task('index', function (cb) {
  var index = env == 'prod' ? './src/index-prod.html' : './src/index-dev.html'

  return gulp.src(index)
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('setdev', (cb) => {
  env = 'dev';
  cb();
});

gulp.task('setprod', (cb) => {
  env = 'prod';
  cb();
});

gulp.task('compileScripts', () => {

  if(env == 'prod'){
    //do rev stuff here
    return gulp.src(['./temp/external-bundle.js', './temp/local-bundle.js', './temp/templates.js'])
      .pipe(uglify({mangle:true}))
      .pipe(concat('bundle.js'))
      .pipe(gulp.dest('./dist'));
  }
  else{
    return gulp.src(['./temp/external-bundle.js', './temp/local-bundle.js', './temp/templates.js'])
      .pipe(gulp.dest('./dist'));
  }
});

gulp.task('compileStyles', () => {
  if(env == 'prod'){
    //do rev stuff here
    //optimise css
    // minifyCSS
    return gulp.src(['./temp/external-styles.css', './temp/local-styles.css'])
      .pipe(concat('styles.css'))
      .pipe(gulp.dest('./dist'));
  }
  else{
    return gulp.src(['./temp/external-styles.css', './temp/local-styles.css'])
      .pipe(gulp.dest('./dist'));
  }
});


// build to cache
// watch cache to compile all
// watch basics to trigger builds

gulp.task('watch', () => {
  gulp.watch(scripts, gulp.series('localScripts'));
  gulp.watch(views, gulp.series('views'));
  gulp.watch(svgs , gulp.series('views'));
  gulp.watch(styles, gulp.series('less'));

  // gulp.watch('./src/embed-frame.html', gulp.series('index'));
});

gulp.task('watchTemp', gulp.parallel('compileScripts', 'compileStyles', () => {
  gulp.watch(['./temp/local-bundle.js'], gulp.series('compileScripts'));
  gulp.watch(['./temp/external-bundle.js'], gulp.series('compileScripts'));
  gulp.watch(['./temp/templates.js'], gulp.series('compileScripts'));

  gulp.watch(['./temp/local-styles.css'], gulp.series('compileStyles'));
  gulp.watch(['./temp/external-styles.css'], gulp.series('compileStyles'));
}));

gulp.task('serve', () => {
  connect.server({
    root: './dist',
    port: 3000
  });
});


gulp.task('clean', (cb) => {
  gulp.src(['./temp/'], {allowEmpty: true})
    .pipe(clean());

  return gulp.src(['./dist/'], {allowEmpty: true})
    .pipe(clean());
});

gulp.task('dev', gulp.series('setdev', gulp.parallel('less', 'externalStyles', 'localScripts', 'externalScripts', 'views', 'index'), gulp.parallel('watchTemp', 'watch', 'serve')));
gulp.task('prod', gulp.series('clean', 'setprod', gulp.parallel('less', 'externalStyles', 'localScripts', 'externalScripts', 'views', 'index'), gulp.parallel('compileScripts', 'compileStyles')));
gulp.task('default', gulp.series('dev'));