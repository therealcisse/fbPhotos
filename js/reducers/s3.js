/**
 *
 * @flow
 */

'use strict';

import type {Action} from '../actions/types';

export type State = {
  status: 'pending' | 'success' | 'failure';
  files: { [key: string]: mixed; }
};

const initialState = {
  status: 'pending',
  files: {},
};

function s3(state: State = initialState, action: Action): State {
  if (action.type === 'S3_SETUP_SUCCEEDED') {
    return {
      status: 'success',
      files: {},
    };
  }
  if (action.type === 'S3_SETUP_FAILED') {
    return {
      status: 'failure',
      files: {},
    };
  }
  if (action.type === 'S3_UPLOADS') {
    return {
      status: 'success',
      files: action.files,
    };
  }

  if (action.type === 'LOGGED_OUT') {
    return initialState;
  }
  return state;
}

module.exports = s3;
