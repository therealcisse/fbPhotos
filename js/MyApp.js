/**
 *
 * @providesModule MyApp
 * @flow
 */

'use strict';

import React from 'react';
import AppState from 'AppState';
import LoginScreen from './login/LoginScreen';
import StyleSheet from 'StyleSheet';
import View from 'View';
import Platform from 'Platform';
import StatusBar from 'StatusBar';
import { connect } from 'react-redux';

import MyPhotos from 'MyPhotos';

import { loadPhotos, setupS3, } from './actions';

const MyApp = React.createClass({
  componentDidMount: function() {
    AppState.addEventListener('change', this.handleAppStateChange);

    // TODO: ?
  },

  componentWillUnmount: function() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  },

  handleAppStateChange: function(appState) {
    if (appState === 'active') {

      // TODO: ?

      if(this.props.isLoggedIn){

        // this.props.dispatch(setupS3());
        // this.props.dispatch(loadPhotos());
      }

    }
  },

  render: function() {
    if (!this.props.isLoggedIn) {
      return <LoginScreen />;
    }
    return (
      <View style={styles.container}>
        <StatusBar
          translucent={true}
          backgroundColor="rgba(0, 0, 0, 0.2)"
          barStyle="light-content"
         />

        <View style={styles.content}>
          <MyPhotos/>
        </View>

      </View>
    );
  },

});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    ...Platform.select({
      android: {
      },
    })
  },
});

function select(store) {
  return {
    isLoggedIn: store.user.isLoggedIn,
  };
}

export default connect(select)(MyApp);
