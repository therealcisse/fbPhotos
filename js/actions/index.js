/**
 *
 * @flow
 */

'use strict';

import * as loginActions from './login';
import * as photoActions from './photos';
import * as s3Actions from './s3';

module.exports = {
  ...loginActions,
  ...photoActions,
  ...s3Actions,
};
