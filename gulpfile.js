var es = require('event-stream'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    plugins = require('gulp-load-plugins')(),
    _ = require('underscore');

function errorHandler(error) {
    console.log(error);
    // gutil.log(gutil.colors.red(error.toString()));
    this.emit('end');
}

function concatScripts(src, dest) {
    return gulp.src(src)
		.pipe(plugins.concat(dest));
}

function concatStyles(src, dest) {
    return es.concat(
		plugins.rubySass(src.filter(function(s) { return /\.(scss|sass)$/.test(s); }), {
			bundleExec: true
		}),
		gulp.src(src.filter(function(s) { return /\.less$/.test(s); })).pipe(plugins.less())
	)
	.pipe(plugins.concat(dest))
	.on('error', errorHandler);
}

var isProduction = true,
    styles = {
    	'screen.min.css': [
			'node_modules/open-iconic/font/css/open-iconic.scss',
			'bower_components/gridforms/gridforms/gridforms.sass',
			'app/assets/styles/all.sass',
			'app/assets/styles/site.sass'
		]
    },
	scripts = {
		'ie.min.js': [
			'bower_components/es5-shim/es5-shim.js',
			'bower_components/html5shiv/html5shiv.js'
		],
		'site.min.js': [
			'bower_components/jquery/dist/jquery.js',
			'bower_components/snapjs/snap.js',
			'bower_components/responsive-elements/responsive-elements.js',
			'bower_components/gridforms/gridforms/gridforms.js',
			'bower_components/marked/lib/marked.js',
			'node_modules/flakes/js/base.js',
			'app/assets/scripts/**/*.js'
		]
	};

if(gutil.env.dev === true) {
    isProduction = false;
}

gulp.task('styles', function() {
    return concatStyles(styles['screen.min.css'], 'screen.min.css')
                .pipe(plugins.concat('screen.min.css'))
                .pipe(plugins.autoprefixer('last 2 versions', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4', 'Firefox >= 4'))
                // .pipe(isProduction ? plugins.combineMediaQueries({ log: true }) : gutil.noop())
                // .pipe(isProduction ? plugins.cssnano() : gutil.noop())
                .pipe(plugins.size())
                .pipe(gulp.dest('./app/static/styles'))
                .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
    return es.concat(
			concatScripts(scripts['ie.min.js'], 'ie.min.js'),
			concatScripts(scripts['site.min.js'], 'site.min.js')
		  )
	     .pipe(isProduction ? plugins.uglify() : gutil.noop()).on('error', errorHandler)
         .pipe(plugins.size())
         .pipe(gulp.dest('./app/static/scripts'));
});

gulp.task('fonts', function() {
    return gulp.src([
        'bower_components/open-iconic/font/fonts/**/*'
    ]).pipe(gulp.dest('./app/static/fonts'));
});

gulp.task('build', [ 'styles', 'scripts', 'fonts' ]);

gulp.task('serve', [ 'build' ], function() {
    browserSync({
      proxy: 'localhost:8080'
    });

    gulp.watch(_.flatten(_.values(styles)), [ 'styles' ]);
    gulp.watch(_.flatten(_.values(scripts)), [ 'scripts' ]);
    gulp.watch('app/templates/**/*.html', reload);
});

gulp.task('default', [ 'build' ]);
