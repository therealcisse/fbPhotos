/**
 *
 * @flow
 */

'use strict';

import FacebookSDK from 'FacebookSDK';
import ActionSheetIOS from 'ActionSheetIOS';
import {Platform} from 'react-native';
import Alert from 'Alert';

import queryFacebookAPI from './queryFacebookAPI';

import type { Action, ThunkAction } from './types';

async function FacebookLogin(scope): Promise {
  return new Promise((resolve, reject) => {

    FacebookSDK.login((response) => {
      if (response.authResponse) {
        resolve({
          id: response.authResponse.userID,
          access_token: response.authResponse.accessToken,
          expiration_date: new Date(response.authResponse.expiresIn * 1000 +
              (new Date()).getTime()).toJSON()
        });
      } else {
        reject(response);
      }
    }, {
      scope,
    });

  });
}

async function _logInWithFacebook(): Promise<Array<Action>> {
  await FacebookLogin('public_profile,email,user_photos');
  const profile = await queryFacebookAPI('/me', {fields: 'name,email'});

  const action = {
    type: 'LOGGED_IN',
    data: {
      id: profile.id,
      name: profile.name,
    },
  };

  return Promise.resolve(action);
}

export function logInWithFacebook(): ThunkAction {
  return (dispatch) => {
    const login = _logInWithFacebook();

    // Loading friends schedules shouldn't block the login process
    login.then(
      (result) => {
        dispatch(result);
      },
     () => {
       return logOut()(dispatch);
     }
    );
    return login;
  };
}


export function logOut(): ThunkAction {
  return (dispatch) => {
    FacebookSDK.logout();

    // TODO: Make sure reducers clear their state
    return dispatch({
      type: 'LOGGED_OUT',
    });
  };
}

export function logOutWithPrompt(): ThunkAction {
  return (dispatch, getState) => {
    let name = getState().user.name || 'there';

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: `Hi, ${name}`,
          options: ['Log out', 'Cancel'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            dispatch(logOut());
          }
        }
      );
    } else {
      Alert.alert(
        `Hi, ${name}`,
        'Log out?',
        [
          { text: 'Cancel' },
          { text: 'Log out', onPress: () => dispatch(logOut()) },
        ]
      );
    }
  };
}
