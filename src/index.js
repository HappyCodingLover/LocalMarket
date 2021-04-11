import React, {Component} from 'react';
import {store, persistor} from './store';
import {StatusBar, LogBox} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Navigation from './navigation';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import moment from 'moment-timezone';
import messaging from '@react-native-firebase/messaging';

moment.tz.setDefault('Europe/Moscow');

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    SplashScreen.hide();
    StatusBar.setBackgroundColor('#FFFFFF', true);
    await messaging().registerDeviceForRemoteMessages();
    await messaging().requestPermission();
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            <Navigation />
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    );
  }
}
