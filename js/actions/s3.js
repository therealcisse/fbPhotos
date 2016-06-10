/**
 *
 * @flow
 */

'use strict';

import { transferUtility, } from 'react-native-s3';

import env from '../env';

const { s3: {
  bucketName,
}, } = env;

import { NativeModules } from 'react-native';
const AWS3 = NativeModules.AWS3Module;

async function _setupS3(): Promise<Action> {
  const ok = await transferUtility.setupWithNative();

  return Promise.resolve({
    type: ok
      ? 'S3_SETUP_SUCCEEDED'
      : 'S3_SETUP_FAILED',
  });
}

export function setupS3(): ThunkAction {
  return (dispatch) => {

    const action = _setupS3();

    action.then(
      (result) => {
        dispatch(loadFiles());

      }
   ).catch(() => {
     dispatch({ type: 'S3_SETUP_FAILED', });
   });

    return action;
  };
}

async function _loadFiles(): Promise<Action>{
  const files = await AWS3.listObjects(bucketName);
  return Promise.resolve({
    type: 'S3_UPLOADS',
    files: files.reduce((files, file) => ({...files, [file.key]: file, }), {}),
  });
}

export function loadFiles(): ThunkAction {
  return (dispatch) => {

    const action = _loadFiles();

    action.then(
      (result) => {
        dispatch(result);

      }
   );
  };
}
