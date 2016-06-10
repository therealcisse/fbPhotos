/**
 *
 * @providesModule MyPhotos
 * @flow
 */

import React from 'react';

import omit from 'lodash.omit';
import isEmpty from 'lodash.isempty';

import View from 'View';
import StatusBar from 'StatusBar';

import PhotoBrowser from 'react-native-photo-browser';

import { transferUtility, } from 'react-native-s3';

import StyleSheet from 'StyleSheet';

import { connect } from 'react-redux';

import { logOutWithPrompt, loadPhotos, setupS3, loadFiles, } from '../actions';

import { NativeModules } from 'react-native';
const AWS3 = NativeModules.AWS3Module;

import type { Photo, } from '../actions';

import fs from 'react-native-fs';

import ActionSheetIOS from 'ActionSheetIOS';
import {Platform} from 'react-native';
import Alert from 'Alert';

import env from '../env';

const { s3: {
  bucketName,
}, } = env;

let subscriptionKeys = {};

function handleUploadFile(key, path) {
		return new Promise((resolve, reject) => {

     function onStateChange(err, task) {
       if (err) {
         reject(err);
         return;
       }

       switch(task.state){
         case 'canceled':
         case 'failed':

           transferUtility.unsubscribe(task.id);
           subscriptionKeys = omit(subscriptionKeys, [key]);
           reject(new Error('Upload error'));
           break;

         case 'completed':

           transferUtility.unsubscribe(task.id);
           subscriptionKeys = omit(subscriptionKeys, [key]);
           resolve(task);
           break;
       }
     }

      transferUtility.upload({
  			bucket: bucketName,
  			key,
  			file: path,
  		}).then(function(task){
          switch(task.state){
            case 'waiting':
            case 'in_progress':
            // case 'pause':

              subscriptionKeys[key] = task.id;
              transferUtility.subscribe(task.id, onStateChange);
              break;

            case 'canceled':
            case 'failed':

              subscriptionKeys = omit(subscriptionKeys, [key]);
              reject(new Error('Upload error'));
              break;

            case 'completed':

              subscriptionKeys = omit(subscriptionKeys, [key]);
              resolve(task);
              break;
          }

      }, function(error){
        subscriptionKeys = omit(subscriptionKeys, [key]);
        reject(error);
      });

    });
	};

function upload(media){
  const path = fs.DocumentDirectoryPath + '/' + media.id;

  return fs.exists(path).then(function(yes){
    if(yes){
      return handleUploadFile(media.id, path);
    }else{
      return fs.downloadFile(media.photo, path).then(() => {
        return handleUploadFile(media.id, path);
      });
    }
  });
}

function uploadWithPrompt(media, cb){

  function onSuccess(){
    stopBusy();
    cb(null);
  }
  function onError(error){
    stopBusy();
    cb(error);
  }

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: 'Upload this photo?',
        options: ['Yes', 'No'],
        destructiveButtonIndex: 0,
        cancelButtonIndex: 1,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          busy();
          upload(media).then(onSuccess, onError);
          return;
        }

        cb(null);
      }
    );
  }

  if (Platform.OS === 'android'){
    Alert.alert(
      'Confirmation',
      'Upload this photo?',
      [
        { text: 'No', onPress: () => cb(null) },
        { text: 'Yes', onPress: () => {
            busy();
            upload(photo).then(onSuccess, onError);
          }
        },
      ]
    );
  }
}

function busy(){
  StatusBar.setNetworkActivityIndicatorVisible(true);
}

function stopBusy(){
  if(isEmpty(subscriptionKeys)){
    StatusBar.setNetworkActivityIndicatorVisible(false);
  }
}

function cancelOrDeleteWithPrompt(media, cb){
  const key = subscriptionKeys[media.id];

  function remove(){
    busy();

    function onDone(){
      stopBusy()
      cb();
    }

    AWS3.delObject(bucketName, media.id).then(onDone, onDone);
  }

  if(key){
    delete subscriptionKeys[media.id];

    function cancel(){
      transferUtility.getTask(key).then(function(task){
        switch(task.state){
          case 'waiting':
          case 'in_progress':
          case 'pause':

            transferUtility.unsubscribe(task.id);
            transferUtility.cancel(task.id);

            stopBusy();

            break;

          default:

            transferUtility.unsubscribe(task.id);
            remove();
        }

        cb();
      }, cb);
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Cancel this upload?',
          options: ['Yes', 'No'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            cancel();
            return;
          }

          cb();
        }
      );
    }

    if (Platform.OS === 'android'){
      Alert.alert(
        'Confirmation',
        'Cancel this upload?',
        [
          { text: 'No', onPress: cb },
          { text: 'Yes', onPress: () => {
              cancel();
            }
          },
        ]
      );
    }

  }else{
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Delete this photo?',
          options: ['Yes', 'No'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            remove();
            return;
          }

          cb();
        }
      );
    }

    if (Platform.OS === 'android'){
      Alert.alert(
        'Confirmation',
        'Delete this photo?',
        [
          { text: 'No', onPress: cb },
          { text: 'Yes', onPress: () => {
              remove();
            }
          },
        ]
      );
    }
  }
}

class MyPhotos extends React.Component{
  props: {
    photos: Array<Photo>;
  };

  constructor(props){
    super(props);

    this.props.dispatch(setupS3());
    this.props.dispatch(loadPhotos());
  }

  componentDidMount() {
  }

  _onSelectionChanged = (media, index, isSelected) => {

    if(isSelected){
      uploadWithPrompt(media, () => {
        this.props.dispatch(loadFiles());
      });
    }else{
      cancelOrDeleteWithPrompt(media, () => {
        this.props.dispatch(loadFiles());
      });
    }
  }

  render(){
    const { photos, s3, } = this.props;

    const media = photos.map(({ id, name, images, }) => ({
      id,
      caption: name || '',
      photo: images[0].source,
      selected: isPhotoSelected(s3, id),
    }));

    return (
      <View style={styles.container}>

        <StatusBar
          barStyle="default"
         />

        <PhotoBrowser
          onBack={() => { this._logOutWithPrompt(); }}
          mediaList={media}
          displayNavArrows={false}
          displaySelectionButtons={true}
          displayActionButton={false}
          startOnGrid={true}
          enableGrid={true}
          useCircleProgress
          onSelectionChanged={this._onSelectionChanged}
        />

      </View>
    );
  }

  _logOutWithPrompt(){
    this.props.dispatch(logOutWithPrompt());
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

function select(store) {
  return {
    photos: store.photos,
    s3: store.s3,
  };
}

export default connect(select)(MyPhotos);

function isPhotoSelected({ status, files, }, id){
  if(status === 'pending' || status === 'failure'){
    return false;
  }

  return !!files[id];
}
