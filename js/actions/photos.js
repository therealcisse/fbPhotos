/**
 *
 * @flow
 */

'use strict';

import type { Action } from './types';

import queryFacebookAPI from './queryFacebookAPI';

import InteractionManager from 'InteractionManager';

import type { ThunkAction } from './types';

async function getPhotos(){
  const response = await queryFacebookAPI('/me/photos', {"fields":"id,name,images","limit":"1000","type":"uploaded"});

  const list = response.data;

  return Promise.resolve(list);
}

async function _loadPhotos(): Promise<Action> {
  const list = await getPhotos();

  return Promise.resolve({
    type: 'PHOTOS_LOADED',
    list,
  });
}

export function loadPhotos(): ThunkAction {
  return (dispatch) => {
    const action = _loadPhotos();

    action.then(
      (result) => {
        InteractionManager.runAfterInteractions(() => {
          dispatch(result);
        });
      },
      () => {
        dispatch({
          type: 'PHOTOS_LOADED',
          list: [],
        });
      }
    );

  };
}
