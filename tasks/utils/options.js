var _ = require('lodash');
var $ = require('gulp-load-plugins')({});
var minimist = require('minimist');

var PRODUCTION_BUILD_TYPE = 'production';

// Function creates a new options object each time
// This options object should be generated once for each execution of quick-sip
// and passed into all task registrations that require this object
module.exports = function() {
  var argv = minimist(process.argv.slice(2));
  var buildType = argv.type;
  var baseDefaults = {
    taskPrefix: '',
    src: 'app',
    dist: 'dist',
    clean: {},
    browserify: {},
    styles: {},
    copy: {}
  };

  // Generate bundle defaults from an options parameter
  function generateBundleDefaults(opts) {
    return {
      clean: {
        skip: false,
        dist: opts.dist
      },
      browserify: {
        skip: false,
        root: './' + opts.src + '/app',
        transforms: [],
        out: 'app.js',
        failOnError: false,
        debug: buildType !== PRODUCTION_BUILD_TYPE,
        dist: opts.dist
      },
      styles: {
        skip: false,
        root: opts.src + '/app.scss',
        src: opts.src,
        includes: [],
        dist: opts.dist
      },
      jshint: {
        src: './' + opts.src + '/**/*.js',
        skip: false,
        stopOnFail: true,
        config: {}
      },
      copy: {
        skip: false,
        src: opts.src,
        excludes: 'scss',
        dist: opts.dist,

        /**
         * Constructs the [source, exclusion] pair used when copying resources.
         * Takes in an optional source location, defaults to the copy.src setting if not provided.
         */
        _buildSrcExclusionPair: function(optionalSrc) {
          var sourceLoc = optionalSrc || this.src;
          return [
              sourceLoc + '/**/*.*',
              '!' + sourceLoc + '/**/*.+(' + this.excludes + ')'
          ]
        },

        /**
         * Builds a flat map of all the [source, exclusion] pairs.
         * Each item in the copy.src array will construct a new pair. If copy.src is just a single item, return the single pair.
         */
        buildFullSrcArray: function() {
          var copyOptions = this;
          if (Array.isArray(this.src)) {
            return this.src.map(function(entry) {
              return copyOptions._buildSrcExclusionPair(entry);
            }).reduce(function(copy, exclude) {
              return copy.concat(exclude);
            });
          } else {
            return this._buildSrcExclusionPair();
          }
        }
      }
    };
  }

  var options = _.merge({}, baseDefaults, generateBundleDefaults(baseDefaults));

  // Update options
  // For certain options, if a key isn't defined at the task level, it will default to the value specified at the top level
  options.update = function(newOptions) {
    var bundleDefaults = generateBundleDefaults(_.merge({}, baseDefaults, newOptions));

    return _.merge(options, bundleDefaults, newOptions);
  };

  return options;
};
