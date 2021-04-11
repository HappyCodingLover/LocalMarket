import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import messaging from '@react-native-firebase/messaging';
import {NotificationServices} from '../services';

import Loading from '@screens/Loading';
import Walkthrough from '@screens/Walkthrough';
import SignIn from '@screens/SignIn';
import PhoneVerification from '@screens/PhoneVerification';
import ErrorScreen from '@screens/ErrorScreen';
import Main from './main';
import NewAddress from '@screens/NewAddress';
import ChangePhoneVerify from '@screens/ChangePhoneVerify';
import ChangePhone from '@screens/ChangePhone';

const Stack = createStackNavigator();

function Navigation() {
  const initNotification = () => {
    messaging().onMessage(async (remoteMessage) => {
      console.log('A new FCM message arrived!', remoteMessage);
      NotificationServices.showNotification(remoteMessage.notification.title, remoteMessage.notification.body);
    });
  };

  React.useEffect(() => {
    initNotification();
  }, []);
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Loading">
          <Stack.Screen
            name="Loading"
            component={Loading}
            options={{headerShown: false, gestureEnabled: false}}
          />
          <Stack.Screen
            name="Walkthrough"
            component={Walkthrough}
            options={{headerShown: false, gestureEnabled: false}}
          />
          <Stack.Screen
            name="SignIn"
            component={SignIn}
            options={{headerShown: false, gestureEnabled: false}}
          />
          <Stack.Screen
            name="PhoneVerification"
            component={PhoneVerification}
            options={{headerShown: false, gestureEnabled: false}}
          />
          <Stack.Screen
            name="ErrorScreen"
            component={ErrorScreen}
            options={{headerShown: false, gestureEnabled: false}}
          />
          <Stack.Screen
            name="Main"
            component={Main}
            options={{headerShown: false, gestureEnabled: false}}
          />
          <Stack.Screen
            name="NewAddress"
            component={NewAddress}
            options={{headerShown: false, gestureEnabled: false}}
          />
          <Stack.Screen
            name="ChangePhoneVerify"
            component={ChangePhoneVerify}
            options={{headerShown: false, gestureEnabled: false}}
          />
          <Stack.Screen
            name="ChangePhone"
            component={ChangePhone}
            options={{headerShown: false, gestureEnabled: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default Navigation;
