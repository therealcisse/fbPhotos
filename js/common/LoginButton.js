/**
 *
 * @flow
 */
'use strict';

import React from 'react';
import {StyleSheet} from 'react-native';
import MyButton from 'MyButton';

import { logInWithFacebook } from '../actions';
import {connect} from 'react-redux';

class LoginButton extends React.Component {
  props: {
    style: any;
    dispatch: (action: any) => Promise;
    onLoggedIn: ?() => void;
  };
  state: {
    isLoading: boolean;
  };
  _isMounted: boolean;

  constructor() {
    super();
    this.state = { isLoading: false };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    if (this.state.isLoading) {
      return (
        <MyButton
          style={[styles.button, this.props.style]}
          caption="Please wait..."
        />
      );
    }

    return (
      <MyButton
        style={[styles.button, this.props.style]}
        icon={require('../login/img/f-logo.png')}
        caption="Log in with Facebook"
        onPress={() => this.logIn()}
      />
    );
  }

  async logIn() {
    const {dispatch, onLoggedIn} = this.props;

    this.setState({isLoading: true});
    try {
      await Promise.race([
        dispatch(logInWithFacebook()),
        timeout(15000),
      ]);
    } catch (e) {
      const message = e.error ? e.error.message || e.error  : e.message || e;
      if (message !== 'Timed out' && message !== 'Canceled by user') {
        alert(message);
        console.warn(e);
      }
      return;
    } finally {
      this._isMounted && this.setState({isLoading: false});
    }

    onLoggedIn && onLoggedIn();
  }
}

async function timeout(ms: number): Promise {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('Timed out')), ms);
  });
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    width: 270,
  },
});

export default connect()(LoginButton);
