/**
 *
 * @flow
 */

'use strict';

export type Action =
    { type: 'LOGGED_IN', data: { id: string; name: string; } }
  | { type: 'LOGGED_OUT' }
  | { type: 'LOADED_PHOTOS' }
  | { type: 'PHOTOS_LOADED', list: Array<Object> }
  | { type: 'S3_SETUP_SUCCEEDED' }
  | { type: 'S3_SETUP_FAILED' }
  | { type: 'SETUP_S3' }
  | { type: 'S3_UPLOADS', tasks: { [key: string]: mixed; } }
  ;

export type Dispatch = (action: Action | ThunkAction | PromiseAction | Array<Action>) => any;
export type GetState = () => Object;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
export type PromiseAction = Promise<Action>;
