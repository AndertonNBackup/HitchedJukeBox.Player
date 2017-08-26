var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var nodemon = require("gulp-nodemon");
var console = require("better-console");
var exec = require('child_process').exec;

gulp.task("build", function () {
    // console.clear();
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("./dist"));
});

gulp.task('watch', ['build'], function () {
    var stream = nodemon({
        script: 'dist/server'
        , watch: 'src'
        , tasks: ['build']
    }).on('restart', () => {
        exec('touch ../client/src/app/main.ts');
    });
    return stream
})