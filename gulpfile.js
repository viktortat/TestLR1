/// 
'use strict';

var port = 8000;
var gulp = require('gulp'),
    connect = require('gulp-connect'),
    autoprefixer = require('gulp-autoprefixer'),
    opn = require('opn'),
    livereload = require('gulp-livereload'),
    concatCss = require('gulp-concat-css'),
    sourcemaps = require('gulp-sourcemaps'),
    changed = require('gulp-changed'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    rimraf = require('rimraf'),
    del = require('del'),
    lr = require('tiny-lr'),
    server = lr();

var bc = './comp/';
//http://habrahabr.ru/post/261467/
//http://codereview.stackexchange.com/questions/62986/optimizing-gulpfile-js
//https://github.com/kriasoft/SPA-Seed.Front-end/blob/master/gulpfile.js
//http://frontender.info/getting-started-with-gulp-2/
//http://frontender.info/handling-sync-tasks-with-gulp-js/

//Пути
var path = {
    build: {
        js: './build/js/',
        css: './build/css/',
        images: './build/img/',
        imgres: './build/img/resize/',
        fonts: './build/fonts/',
        fontsBootstrap: 'build/fonts/bootstrap/'
    },
    src: {
        js: './app/js/*.js',
        styles: 'src/styles/template_styles.scss',
        css: './app/css/**/*.css',
        stylesPartials: 'src/styles/partials/',
        spriteTemplate: 'src/sass.template.mustache',
        images: './app/img/**/*.*',
        sprite: 'sprite/*.*',
        fonts: 'fonts/**/*.*',
        fontsBootstrap: 'comp/bootstrap-sass/assets/fonts/bootstrap/*.*'
    },
    watch: {
        js: './app/js/**/*.js',
        styles: 'styles/**/*.scss',
        css: './app/css/**/*.css',
        images: 'img/**/*.*',
        sprite: 'sprite/*.*',
        fonts: 'fonts/**/*.*'
    },
    clean: './build',
    cleanDoc: './DocHelp-jsdoc'
};


// middleware function to pass to connect
function middlewares(connect, opt) {
    return [getTranslatorKey, naverTranslator.route, redirectToChat]
}
// Запуск сервера
gulp.task('connectSrvLR', function() {
    connect.server({
        //root: '.', //Не дает с корня работать - ошибка доступа при localhost
        root: 'app',
        port: port,
        livereload: true
        //middleware: middlewares
    });
    opn('http://localhost:'+port)
});

//Предварительная очистка
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});
//Предварительная очистка
gulp.task('cleanDoc', function (cb) {
    rimraf(path.cleanDoc, cb);
});

//====================================================================
// Работа с html
gulp.task('build:html', function () {
    gulp.src('./app/*.html')
    //.pipe(connect.reload())
    .pipe(livereload())
});

// Работа с css
gulp.task('build:css', function () {
    gulp.src('./app/css/**/*.css')
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(concatCss("css/bundle.css"))
    .pipe(gulp.dest('build'))
    //.pipe(connect.reload())
    .pipe(livereload())
});

// Работа с js
gulp.task('build:js', function () {
    gulp.src('./app/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build'))
    //.pipe(connect.reload())
    .pipe(livereload())
});

//--------------------------------------------------------------------

gulp.task('default', ['connectSrvLR','watch']);
// Watch
gulp.task('watch', function () {
    //gulp.watch("./css/**/*.css", ["css"]);
    //gulp.watch("./*.html", ["html"]);
    //gulp.watch("./img/**/*", ["img"]);
    //gulp.watch("./img/**/*", ["imr"]);
    //gulp.watch("./assets/js/libs/*.js", ["jslibs"]);
    //gulp.watch("./assets/js/modules/**/*.js", ["jsmods"]);

    livereload.listen();
    gulp.watch(['./app/**/*.html'], ['build:html']);
    //gulp.watch(['./app/**/*.html']).on('change', livereload.reload);

    gulp.watch(['./app/css/**/*.css'], ['build:css']);
    gulp.watch(['./app/js/**/*.js'], ['build:js']);
    gulp.watch(['./app/sass/**/*.scss'], ['sass:watch']);
    gulp.watch('./sass/**/*.scss', ['sass']);

/*
    gulp.watch("./js/*.js", ["js:livereload"]);
    livereload.listen();
    gulp.watch(['./*.html']).on('change', livereload.reload);
*/
    //gulp.watch(['./js/*.js']).on('change', livereload.changed);
    //gulp.watch(['./**/*.js']).on('change', livereload.reload);
    //gulp.watch(['./*.html'], ['html']);
});
