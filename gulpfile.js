var gulp = require("gulp"),
    pug = require("gulp-pug"),
    stylus = require("gulp-stylus"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    jshint = require("gulp-jshint"),
    rename = require("gulp-rename");

var config = {
  stylus: {
    src: ["src/stylus/*.styl"],
    dest: "public/stylesheets/"
  },
  pug: {
    src: "src/pug/**/*.pug",
    dest: "app_client",
    options: {
      pretty: true
    }
  },
  js: {
    src: "app_client/**/*.js",
    dest: "public/javascripts"
  }
};

gulp.task("stylus", function() {
  return gulp.src(config.stylus.src)
    .pipe(stylus())
    .pipe(gulp.dest(config.stylus.dest));
});

gulp.task("pug", function() {
  return gulp.src(config.pug.src)
    .pipe(pug(config.pug.options))
    .pipe(gulp.dest(config.pug.dest));
});

gulp.task("js", function() {
  return gulp.src(config.js.src)
    .pipe(concat("todoCalendar.js"))
    .pipe(gulp.dest(config.js.dest))
    .pipe(jshint())
    .pipe(jshint.reporter("default"))
    .pipe(rename("todoCalendar.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest(config.js.dest));
});

gulp.task("watch", function() {
  gulp.watch(config.stylus.src, ["stylus"]);
  gulp.watch(config.pug.src, ["pug"]);
  gulp.watch(config.js.src, ["js"]);
});

gulp.task("default", ["stylus", "pug", "js", "watch"]);
