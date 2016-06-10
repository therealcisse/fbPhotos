/**
 *
 * @flow
 */

'use strict';

import React from 'react';

import MyApp from 'MyApp';
import FacebookSDK from 'FacebookSDK';

import { Provider } from 'react-redux';
import configureStore from './store/configureStore';

function setup(): React.Component {
  console.disableYellowBox = true;

  FacebookSDK.init();

  class Root extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = {
        isLoading: true,
        store: configureStore(() => this.setState({isLoading: false})),
      };
    }
    render() {
      if (this.state.isLoading) {
        return null;
      }
      return (
        <Provider store={this.state.store}>
          <MyApp />
        </Provider>
      );
    }
  }

  return Root;
}

global.LOG = (...args) => {
  console.log('/------------------------------\\');
  console.log(...args);
  console.log('\\------------------------------/');
  return args[args.length - 1];
};

module.exports = setup;
