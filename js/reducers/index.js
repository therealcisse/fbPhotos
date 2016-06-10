/**
 *
 * @flow
 */

'use strict';

import { combineReducers } from 'redux';

module.exports = combineReducers({
  user: require('./user'),
  photos: require('./photos'),
  s3: require('./s3'),
});
