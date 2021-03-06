var gulp = require("gulp");
var clean = require("gulp-clean");
var rename = require("gulp-rename");
var stylus = require("gulp-stylus");
var build = require("./lib/gulp-build");
var plumber = require("gulp-plumber");
var open = require("gulp-open");
var runSequence = require("run-sequence");
var eventStream = require("event-stream");
var connect = require("gulp-connect");
var path = require("path");
var fs = require("fs");
var _ = require("lodash");
var hbsHelpers = require("./lib/hbs-helpers");
var partialsConfig = [];
var vendorFiles = [
  "./bower_components/slick-carousel/slick/fonts/*",
  "./bower_components/slick-carousel/slick/slick.css",
  "./bower_components/slick-carousel/slick/slick.min.js",
  "./bower_components/slick-carousel/slick/ajax-loader.gif",
  "./bower_components/jquery/dist/jquery.min.js",
  "./bower_components/jquery/dist/jquery.min.map",
  "./bower_components/fastclick/lib/fastclick.js"
];
var PORT = 1337;

gulp.task("dev", function(cb) {
  runSequence("build", "watch", "server", "open", cb);
});

gulp.task("watch", function(cb) {
  gulp.watch("./src/styles/**/*.styl", ["allStyles"]);
  gulp.watch(["./lib/hbs-helpers.js", "./src/partials/*.hbs", "./src/layouts/*.hbs"], function() {
    runSequence("buildPartialsConfig", "html", "reloadAllHtml");
  });
  gulp.watch(["./src/templates/**/*.hbs", "./src/data/*.json"], function() {
    runSequence("html", "reloadAllHtml");
  });
  gulp.watch("./assets/javascript/**/*.js", function(ev) {
    if (ev.type === "changed") {
      gulp.src(ev.path).pipe(connect.reload());
    }
  });
  cb();
});

// TODO: Use gulp-changed or gulp-newer in the tasks themselves to only
// process files that need to be processed.
gulp.task("build", function(cb) {
  runSequence("clean", ["allStyles", "buildPartialsConfig"], ["html", "vendor"], cb);
});

gulp.task("vendor", function() {
  return gulp.src(vendorFiles, { base: "bower_components" }).pipe(gulp.dest("./assets/vendor"));
});

gulp.task("clean", function() {
  return gulp
    .src(["./assets/css", "./*.html", "./work/**/*.html", "./assets/vendor"], {
      read: false
    })
    .pipe(clean());
});

gulp.task("allStyles", function(cb) {
  runSequence(["styles", "newStyles"], cb);
});

gulp.task("styles", function() {
  return gulp
    .src("./src/styles/main.styl")
    .pipe(plumber())
    .pipe(
      stylus({
        paths: [path.resolve(__dirname, "bower_components"), path.resolve(__dirname, "node_modules")],
        set: ["compress", "linenos"]
      })
    )
    .pipe(gulp.dest("./assets/css"))
    .pipe(connect.reload());
});

gulp.task("newStyles", function() {
  return gulp
    .src("./src/styles/new/main.styl")
    .pipe(plumber())
    .pipe(
      stylus({
        paths: [path.resolve(__dirname, "bower_components"), path.resolve(__dirname, "node_modules")],
        set: ["compress", "linenos"]
      })
    )
    .pipe(gulp.dest("./assets/css/new"))
    .pipe(connect.reload());
});

gulp.task("reloadAllHtml", function() {
  return gulp.src(["./*.html", "./work/*.html"]).pipe(connect.reload());
});

gulp.task("html", function(cb) {
  runSequence(["workHTML", "otherHTML", "newWorkHTML", "newOtherHTML"], cb);
});

gulp.task("workHTML", function() {
  var data = JSON.parse(fs.readFileSync("./src/data/data.json"));
  var workData = JSON.parse(fs.readFileSync("./src/data/work.json"));
  var options = {
    helpers: hbsHelpers,
    partials: partialsConfig,
    layout: fs.readFileSync(path.join(__dirname, "src/layouts/default.hbs"), {
      encoding: "utf8"
    })
  };

  var workTasks = workData.map(function(workDatum) {
    var _data = _.cloneDeep(data);
    _data.work = workDatum;
    return gulp
      .src("./src/templates/work.hbs")
      .pipe(plumber())
      .pipe(build(_data, options))
      .pipe(
        rename({
          basename: workDatum.slug,
          extname: ".html"
        })
      )
      .pipe(gulp.dest("./work/"));
  });

  return eventStream.merge.apply(null, workTasks);
});

gulp.task("newWorkHTML", function() {
  var data = JSON.parse(fs.readFileSync("./src/data/data.json"));
  var workData = JSON.parse(fs.readFileSync("./src/data/work_new.json"));
  var options = {
    helpers: hbsHelpers,
    partials: partialsConfig,
    layout: fs.readFileSync(path.join(__dirname, "src/layouts/default_new.hbs"), {
      encoding: "utf8"
    })
  };

  var workTasks = workData.map(function(workDatum) {
    var _data = _.cloneDeep(data);
    _data.work = workDatum;
    return gulp
      .src("./src/templates/new/work_new.hbs")
      .pipe(plumber())
      .pipe(build(_data, options))
      .pipe(
        rename({
          basename: workDatum.slug,
          extname: ".html"
        })
      )
      .pipe(gulp.dest("./work/new/"));
  });

  return eventStream.merge.apply(null, workTasks);
});

gulp.task("otherHTML", function() {
  var data = JSON.parse(fs.readFileSync("./src/data/data.json"));
  var workData = JSON.parse(fs.readFileSync("./src/data/work.json"));
  data.work = workData;
  var options = {
    helpers: hbsHelpers,
    partials: partialsConfig,
    layout: fs.readFileSync(path.join(__dirname, "src/layouts/default.hbs"), {
      encoding: "utf8"
    })
  };

  return gulp
    .src(["./src/templates/*.hbs", "!./src/templates/work.hbs"])
    .pipe(plumber())
    .pipe(build(data, options))
    .pipe(
      rename({
        extname: ".html"
      })
    )
    .pipe(gulp.dest("./"));
});

gulp.task("newOtherHTML", function() {
  var data = JSON.parse(fs.readFileSync("./src/data/data.json"));
  var workData = JSON.parse(fs.readFileSync("./src/data/work.json"));
  data.work = workData;
  var options = {
    helpers: hbsHelpers,
    partials: partialsConfig,
    layout: fs.readFileSync(path.join(__dirname, "src/layouts/default_new.hbs"), {
      encoding: "utf8"
    })
  };

  return gulp
    .src(["./src/templates/new/*.hbs", "!./src/templates/new/work_new.hbs"])
    .pipe(plumber())
    .pipe(build(data, options))
    .pipe(
      rename({
        extname: ".html"
      })
    )
    .pipe(gulp.dest("./"));
});

gulp.task("buildPartialsConfig", function(cb) {
  var partialsList = fs.readdirSync(path.resolve(__dirname, "src/partials"));
  for (var i = 0, j = partialsList.length; i < j; i++) {
    var filename = partialsList[i];
    partialsConfig.push({
      name: path.basename(filename, ".hbs"),
      tpl: fs.readFileSync(path.join(__dirname, "src/partials", filename), {
        encoding: "utf8"
      })
    });
  }
  cb();
});

gulp.task(
  "server",
  connect.server({
    root: [__dirname],
    port: PORT,
    livereload: true
  })
);

gulp.task("open", function() {
  return gulp.src(__filename).pipe(
    open({
      uri: "http://localhost:" + PORT + "/index.html"
    })
  );
});

gulp.task("default", ["build"], function() {
  console.log("Your changes have been compiled!");
  console.log("You can now run `git commit` to commit your changes.");
  console.log("After commiting, run `git push` to deploy your changes to the Web.");
});
