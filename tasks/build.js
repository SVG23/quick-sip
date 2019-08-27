var log = require('color-log'),
    runSequenceGenerator = require('run-sequence'),
    createBundleTasks = require('./utils/createBundleTasks');

function build(callback) {
  var runSequence = runSequenceGenerator.use(gulp),
      buildTasks = [],
      browserifyCompleteFn = function() {
        log.mark('[BROWSERIFY] complete!');
        callback();
      };

  if (!options.styles.skip) {
    buildTasks.push(options.taskPrefix + 'build-styles');
  }

  if (!options.copy.skip) {
    buildTasks.push(options.taskPrefix + 'copy-resources');
  }

  if (!options.browserify.skip) {
    buildTasks.push(options.taskPrefix + 'build-app');
    tasks.browserify.createBundler();
  }

  if (options.clean.skip) {
    runSequence(options.taskPrefix + 'jshint', buildTasks, browserifyCompleteFn);
  } else {
    runSequence(options.taskPrefix + 'jshint', options.taskPrefix + 'clean', buildTasks, browserifyCompleteFn);
  }
}

module.exports = function(gulp, options) {
  var tasks = createBundleTasks(gulp, options);

  /* Full build */
  gulp.task(options.taskPrefix + 'build', build);

  // Alias default to do the build.  After this file is run the default task can be overridden if desired.
  gulp.task('default', build);
};
