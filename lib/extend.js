/*
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

var combineJSON = require('./utils/combineJSON'),
    deepExtend = require('./utils/deepExtend'),
    fs = require('fs-extra'),
    _ = require('lodash');

/**
 * Extend the Style Dictionary builder module
 * @param {Object} opts
 * @returns {StyleDictionary}
 */
function extend(opts) {
  var options, to_ret;

  // Overloaded method, can accept a string as a path that points to a JSON file
  // or a plain object. Potentially refactor.
  if (_.isString(opts)) {
    options = fs.readJsonSync(opts);
  } else {
    options = opts;
  }

  // Creating a new object and copying over the options
  // Also keeping an options object just in case
  to_ret = deepExtend({options: options}, this, options);

  // Update properties with includes from dependencies
  if (options.include) {
    if (!_.isArray(options.include))
      throw new Error('include must be an array');

    _.forEach(options.include, function(file){
      to_ret.properties = deepExtend({}, to_ret.properties, require(file));
    });

    to_ret.include = null; // We don't want to carry over include references
  }

  // Update properties with current package's source
  // These highest precedence
  if (options.source) {
    if (!_.isArray(options.source))
      throw new Error('source must be an array');

    var props = combineJSON(options.source, {deep: true});
    to_ret.properties = deepExtend({}, to_ret.properties, props);
    to_ret.source = null; // We don't want to carry over the source references
  }

  return to_ret;
}

module.exports = extend;
