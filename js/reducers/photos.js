/**
 *
 * @flow
 */

'use strict';

import type {Action} from '../actions/types';

export type Photo = {
  id: string;
  name?: ?string;
  images: Array<{
    source: string;
    height: number;
    width: number;
  }>,
};

type State = Array<Photo>;

function photos(state: State = [], action: Action): State {
  if (action.type === 'PHOTOS_LOADED') {
    return action.list;
  }

  if (action.type === 'LOGGED_OUT') {
    return [];
  }
  return state;
}

module.exports = photos;
