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
    pngquant  = require('imagemin-pngquant'),
    imagemin = require('gulp-imagemin'),
    imageResize = require('gulp-image-resize'),
    sass = require('gulp-sass'),
    jsdoc = require("gulp-jsdoc"),
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
gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(sourcemaps.init())            //Инициализируем sourcemap
        .pipe(uglify())                     //Сожмем наш js
        .pipe(rename(function (path) {
            if (path.extname === '.js') {
                path.basename += '.min';
            }
        }))
        .pipe(sourcemaps.write())           //Пропишем карты
        .pipe(gulp.dest(path.build.js));     //Выплюнем готовый файл в build
    //.pipe(connect.reload());
});

gulp.task('sass', function () {
    gulp.src('./app/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./build/css'));
});

//http://www.graphicsmagick.org/download.html
gulp.task('imgResize:build', function () {
    gulp.src('./app/img/*.{jpg,png}')
        //.pipe(imageResize({ width : 100 }))
        .pipe(imageResize({
            width : 600,
            height : 300,
            //crop : true,
            upscale : true
        }))
        //.pipe(gulp.dest('dist'));
        .pipe(rename({suffix: '-300'}))
        .pipe(gulp.dest(path.build.imgres));
    //.pipe(notify('images-resize task COMPLETE'));
});

// img-opt task optimizes all images
gulp.task('img-opt', function () {
    return gulp.src('./app/img/*.{jpg,png}')
        .pipe(imagemin({optimizationLevel: 3, progressive: true, interlaced: true}))
        //.pipe(rename(function (path) { path.basename += "-thumbnail"; }))
        .pipe(gulp.dest('build/img-opt'));
    //.pipe(notify('img-opt task COMPLETE'));
});

gulp.task('img', function () {
    gulp.src('./app/img/*.{jpg,png}')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(path.build.images));
    //.pipe(connect.reload());
});

gulp.task('html:build', function () {
    gulp.src('./app/*.html')
    .pipe(changed('./build'))
    .pipe(gulp.dest('./build/'));
    //.pipe(connect.reload());
});

gulp.task('fonts', function () {
    gulp.src('./app/font/**/*')
        .pipe(gulp.dest('./build/font/'));
    //.pipe(connect.reload());
});

gulp.task('libs', function() {
    gulp.src(bc+'jquery/dist/jquery.js')
        .pipe(gulp.dest('./build/dist/libs/jquery/'));

    gulp.src(bc+'bootstrap/dist/!**!/!*.*')
        .pipe(gulp.dest('./build/dist/libs/bootstrap/'));

    gulp.src(bc+'bootstrap-material-design/dist/!**!/!*.*')
        .pipe(gulp.dest('./build/dist/libs/bootstrap-material-design/'));

    gulp.src([bc+'angular/angular.js',
            bc+'angular-animate/angular-animate.js',
            bc+'angular-cookies/angular-cookies.js',
            bc+'angular-i18n/angular-locale_ru-ru.js',
            bc+'angular-loader/angular-loader.js',
            bc+'angular-resource/angular-resource.js',
            bc+'angular-route/angular-route.js',
            bc+'angular-sanitize/angular-sanitize.js',
            bc+'angular-touch/angular-touch.js',
            bc+'firebase/firebase.js',
            bc+'angularfire/dist/angularfire.js',
        ])
        .pipe(concat('angular.concat.js'))
        .pipe(gulp.dest('./build/dist/libs/angular/'));
});

//--------------------------------------------------------------------
var opts = {
    showPrivate: true,
    monospaceLinks: true,
    cleverLinks: true,
    outputSourceFiles: true
};

gulp.task('doc-1-jsdoc',['cleanDoc'], function() {
    gulp.src(["./app/js/**/*.js", "README.md"])
        .pipe(jsdoc.parser())
        .pipe(jsdoc.generator('./DocHelp-jsdoc'));
//      .pipe(open({app: 'google-chrome', uri: 'http://localhost:'+port}));
//      opn('/DocHelp-jsdoc/index.html')
    opn('http://localhost:63342/TestOnJob/DocHelp-jsdoc')
});

//-----------------------------------------------
var opts2 = {
    showPrivate: true,
    monospaceLinks: true,
    encoding: 'utf8',
    cleverLinks: true,
    outputSourceFiles: true
};

var tpl2 = {
    path            : 'ink-docstrap',
    systemName      : 'ПРИМЕР заголовка',
    footer          : 'Generated with ViktorTat',
    copyright       : 'Сделанно  2015!!!',
    navType         : 'vertical',
    theme           : 'journal', //'journal', //'cerulean'//'cosmo',
    linenums        : false,
    collapseSymbols : false,
    inverseNav      : false
};

//'c:\Users\viktor\Desktop\TestOnJob\node_modules\gulp-jsdoc\node_modules\jsdoc\...DocTempl-default-godamnawful/publish'
//var tmp2 = 'node_modules/gulp-jsdoc/node_modules/ink-docstrap/template';
var tmp2 = './DocTempl/default/tmpl';

gulp.task('doc-2-jsdoc', function() {
    gulp.src(["./app/js/**/*.js", "README.md"])
        .pipe(jsdoc.parser())
        .pipe(jsdoc.generator('./DocHelp-jsdoc-2', tpl2, opts2));
//      .pipe(open({app: 'google-chrome', uri: 'http://localhost:'+port}));
    opn('http://localhost:63342/TestOnJob/DocHelp-jsdoc-2')
});

//--------------------------------------------------------------------
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
