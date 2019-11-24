var gulp = require('gulp');
var webserver = require('gulp-webserver');
var template = require('gulp-template-html');
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var babel = require('gulp-babel');

/** config **/

var isBuiltForRelease = false // 是否要建置為發布用版本
var appFolder = 'app'; // 原始碼位置
var releaseFolder = 'release'; // 發布用資料夾
var developingFolder = 'dev'; // 開發用資料夾

/** functions **/

function sendToDest() {
	return isBuiltForRelease ? releaseFolder : developingFolder;
}

/** 在這裡設定要執行哪些 tasks **/

gulp.task('default', [
	// 'template',
	'moveAsset',
	// 'moveAPIResult',
	'sass',
	'sass:watch',
	// 'js:watch',
	'webserver',
	// 'uglify', // compress js files
	// 'moveSrc',
	'movePage',
	// 'moveLibCss', // lib moved to asset
	// 'babel',
]);

/* 建立本地端server */
gulp.task('webserver', function() {
  gulp.src(`${developingFolder}`)
    .pipe(webserver({
      port: 6789,
      livereload: true,
      directoryListing: false,
      open: true,
      fallback: './index.html'
    }));
});

/* 移動靜態資源 */
gulp.task('moveAsset', function() {
	var sources = [
		`${appFolder}/asset/icon/**/*.*`,
		`${appFolder}/asset/image/**/*.*`,
		`${appFolder}/asset/videos/**/*.*`,
		`${appFolder}/asset/lib/**/*.*`,
		// `${appFolder}/asset/templates/**/*.*`
	]

	return gulp.src( sources, {base: appFolder} )
		.pipe( gulp.dest(sendToDest()) );
});

/* 移動模組 */
gulp.task('moveSrc', function() {
	var sources = [
		`${appFolder}/src/mods/*.js` ];
	return gulp.src( sources, {base: appFolder} )
		.pipe( gulp.dest(sendToDest()) );
});

/* 移動頁面 */
gulp.task('movePage', function() {
	var sources = [
		`${appFolder}/src/pages/**/*.html`,
		`${appFolder}/index.html` ];
	return gulp.src( sources, {base: appFolder} )
		.pipe( gulp.dest(sendToDest()) );
});

/* 移動api測試資料 */
gulp.task('moveAPIResult', function() {
	var sources = [ `${appFolder}/sim_api/*.json` ];

	return gulp.src( sources, {base: appFolder} )
		.pipe( gulp.dest(sendToDest()) );
});

/* 套template */
gulp.task('template', ['template-login', 'template-layout'])
gulp.task('template-layout', function() {
	let sources = [`${appFolder}/src/pages/**/*.html`];
  return gulp.src( sources, {base: appFolder} )
    .pipe( template(`${appFolder}/asset/templates/layout.html`) )
    .pipe( gulp.dest(sendToDest()) );
});
gulp.task('template-login', function() {
	let sources = `${appFolder}/index.html`;
  return gulp.src( sources, {base: appFolder} )
    .pipe( template(`${appFolder}/asset/templates/login.html`) )
    .pipe( gulp.dest(sendToDest()) );
});

/* 處理scss */
gulp.task('sass', function () {
	const srcs = [`${appFolder}/asset/style/layout.scss`, `${appFolder}/style.scss`, `${appFolder}/src/pages/**/*.scss`]
  return gulp.src( srcs, {base: appFolder} )
    .pipe( sass({outputStyle: isBuiltForRelease ? 'compressed' : ''}).on('error', sass.logError) )
    .pipe( gulp.dest(sendToDest()) );
});

/* 監看scss檔案 */
gulp.task('sass:watch', function () {
	const srcs = [`${appFolder}/asset/style/*.scss`, `${appFolder}/style.scss`, `${appFolder}/src/pages/**/*.scss`]
  gulp.watch( srcs, ['sass'] );
});

/* 移動 lib 裡的 css 檔案 */
gulp.task('moveLibCss', function() {
	var sources = [
		`${appFolder}/src/lib/**/*.css` ];
	return gulp.src( sources, {base: appFolder} )
		.pipe( gulp.dest(sendToDest()) );
});

/* ES6 轉 ES5 */
gulp.task('babel', function () {
	gulp.src( `${appFolder}/**/*.js`, {base: appFolder} )
		.pipe( babel({
			presets: ['env']
		}) )
		.pipe( gulp.dest(sendToDest()) );
});

/* 監看js檔案 */
gulp.task('js:watch', function () {
	var sources = [
		`${appFolder}/src/**/*.js`,
		`${appFolder}/src/**/**/*.js`,
	  `${appFolder}/script.js`,
	  `${appFolder}/main.js`];
	return watch( sources, { ignoreInitial: false, base: appFolder } )
		.pipe( gulp.dest(sendToDest()) );
});

/* 壓縮js檔案 */
gulp.task('uglify', function () {
	var sources = [
		`${appFolder}/src/**/*.js`,
		`${appFolder}/src/**/**/*.js`,
	  `${appFolder}/script.js`,
	  `${appFolder}/main.js`];
	return pipeline(
		gulp.src( sources ),
		uglify(),
		gulp.dest( sendToDest() )
	);
});
