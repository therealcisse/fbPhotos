/**
 *
 * @flow
 */
'use strict';

import Animated from 'Animated';
import Dimensions from 'Dimensions';
import Colors from 'Colors';
import Image from 'Image';
import React from 'react';
import StatusBar from 'StatusBar';
import StyleSheet from 'StyleSheet';
import View from 'View';
import { Text } from 'MyText';
import LoginButton from '../common/LoginButton';
import TouchableOpacity from 'TouchableOpacity';

import Platform from 'Platform';

import { connect } from 'react-redux';

class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anim: new Animated.Value(0),
    };
  }

  componentDidMount() {
    StatusBar.setBarStyle('default');

    if(Platform.OS === 'android'){
      StatusBar.setBackgroundColor('rgba(255, 255, 255, 0)');
      StatusBar.setTranslucent(true);
    }

    Animated.timing(this.state.anim, {toValue: 3000, duration: 3000}).start();
  }

  render() {
    return (
      <Image
        style={styles.container}
        source={require('./img/login-background.png')}>
        <View style={styles.section}>
          <Animated.Image
            style={[this.fadeIn(0), styles.logo]}
            source={require('./img/logo.png')}
          />
        </View>
        <View style={styles.section}>
          <Animated.Text style={[styles.h1, this.fadeIn(700, -20)]}>
            Photos
          </Animated.Text>
          <Animated.Text style={[styles.h3, this.fadeIn(1200, 10)]}>
            Upload your facebook photos to Amazon S3
          </Animated.Text>
        </View>
        <Animated.View style={[styles.section, styles.last, this.fadeIn(2500, 20)]}>
          <LoginButton/>
        </Animated.View>
      </Image>
    );
  }

  fadeIn(delay, from = 0) {
    const {anim} = this.state;
    return {
      opacity: anim.interpolate({
        inputRange: [delay, Math.min(delay + 500, 3000)],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
      transform: [{
        translateY: anim.interpolate({
          inputRange: [delay, Math.min(delay + 500, 3000)],
          outputRange: [from, 0],
          extrapolate: 'clamp',
        }),
      }],
    };
  }
}

const scale = Dimensions.get('window').width / 375;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 26,
    // Image's source contains explicit size, but we want
    // it to prefer flex: 1
    width: undefined,
    height: undefined,
  },
  logo: {
    transform: [{
      scale: 6,
    }, {
      rotate: '-15deg',
    }],
    backgroundColor: 'transparent',
  },
  section: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  last: {
    justifyContent: 'flex-end',
  },
  h1: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: Math.round(74 * scale),
    color: Colors.darkText,
    backgroundColor: 'transparent',
  },
  h3: {
    fontSize: 12,
    textAlign: 'center',
    color: Colors.lightText,
    letterSpacing: 1,
  },
});

export default connect()(LoginScreen);
