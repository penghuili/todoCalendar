var gulp = require("gulp"),
    pug = require("gulp-pug"),
    stylus = require("gulp-stylus");

var config = {
  stylus: {
    src: ["src/stylus/*.styl"],
    dest: "public/stylesheets/"
  }
};

gulp.task("stylus", function() {
  return gulp.src(config.stylus.src)
    .pipe(stylus())
    .pipe(gulp.dest(config.stylus.dest));
});

gulp.task("watch", function() {
  gulp.watch(config.stylus.src, ["stylus"]);
});

gulp.task("default", ["stylus", "watch"]);
