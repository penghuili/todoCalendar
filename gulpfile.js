var gulp = require("gulp"),
    pug = require("gulp-pug"),
    stylus = require("gulp-stylus");

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

gulp.task("watch", function() {
  gulp.watch(config.stylus.src, ["stylus"]);
  gulp.watch(config.pug.src, ["pug"]);
});

gulp.task("default", ["stylus", "pug", "watch"]);
