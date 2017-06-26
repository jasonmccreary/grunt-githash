/*
 * grunt-githash
 * https://github.com/jantimon/grunt-githash
 *
 * Copyright (c) 2015 Jan Nicklas
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  var path = require('path');
  var Promise = require("bluebird");
  var git = Promise.promisifyAll(require('git-rev-2'));

  grunt.registerMultiTask('githash', 'Grunt plugin to get the current githash', function () {

    var name = 'githash' + (this.target ? '.' + this.target : '');

    var options = this.options({
      // Break if not inside a git repository
      fail: true,
      length: 7
    });
    var dir = path.resolve(options.dir || '.');
    var done = this.async();

    Promise.all([
      git.longAsync(dir),
      git.tagAsync(dir),
      git.branchAsync(dir)
      ]).then(function(args){
      return {
        short: args[0].substr(0, options.length),
        long: args[0],
        tag: args[1],
        branch: args[2]
      };
    }).catch(function(err) {
      grunt.log.warn('Could not read git information: ' + err);
			if (options.fail) {
				throw err;
			}
      return {};
    }).then(function(gitResult){
      grunt.config.set(name + '.hash', gitResult.long);
      grunt.config.set(name + '.short', gitResult.short);
      grunt.config.set(name + '.tag', gitResult.tag);
      grunt.config.set(name + '.branch', gitResult.branch);
      grunt.log.oklns('Git ' + name + ' = ' + JSON.stringify(gitResult));
      done();
    });

  });

};
