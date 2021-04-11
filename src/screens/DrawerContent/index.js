import React, { Component } from 'react';
import {
  View,
  StatusBar,
  Platform,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';
import { BaseColor, Images } from '@config';
import { Text, TextInput, Image, Icon } from '@components';
import styles from './styles';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import Logo from '../../assets/svgs/logoicon.svg';
import ChatBox from '../../assets/svgs/chatbox.svg';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import RBSheet from 'react-native-raw-bottom-sheet';
import Emoji from 'react-native-emoji';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { bindActionCreators } from 'redux';
import { AuthActions } from '@actions';
import Spinner from 'react-native-loading-spinner-overlay';

class DrawerContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  onChatBtn = () => {
    this.ChatSheet.open();
    this.props.navigation.closeDrawer();
  };

  onLogo = () => {
    const { auth, navigation } = this.props;
    if (auth.addresses.length === 0) {
      Alert.alert(
        'Вы еще не добавили адреса.',
        'Нам нужен ваш адрес, чтобы показать партнерам.',
        [
          {
            text: 'Да',
            onPress: () => {
              navigation.navigate('Address1');
            },
          },
        ],
      );
    } else {
      navigation.navigate('Catalogue');
    }
  };

  onMyProfileBtn = () => {
    const { navigation, auth, actions } = this.props;
    if (auth.user === null) {
      navigation.navigate('SignIn');
    } else {
      navigation.navigate('ProfileEdit');
    }
  };

  renderChatPopup() {
    return (
      <RBSheet
        ref={(ref) => {
          this.ChatSheet = ref;
        }}
        height={Dimensions.get('window').height - 100}
        closeOnDragDown={true}
        dragFromTopOnly={true}
        openDuration={500}
        customStyles={{
          container: {
            backgroundColor: BaseColor.blueBackgroundColor,
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
          },
        }}>
        <ScrollView>
          <View style={{ marginTop: 15, height: 200 }}>
            <View>
              <View style={{ marginHorizontal: 40 }}>
                <Icon name="intercom" size={30} color={BaseColor.whiteColor} />
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                  <Text title1 whiteColor>
                    {'Привет'}
                  </Text>
                  <Emoji name="wave" style={{ fontSize: 25, marginLeft: 5 }} />
                </View>
                <Text whiteColor style={{ marginTop: 10 }}>
                  {
                    'Мы помогаем вашему бизнесу расти, связывая вас с вашими клиентами.'
                  }
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              backgroundColor: '#99A4F1',
              position: 'absolute',
              top: 158,
              left: 20,
              zIndex: 2,
              height: 190,
              width: Dimensions.get('window').width - 40,
              borderRadius: 5,
            }}></View>
          <View
            style={{
              position: 'absolute',
              top: 160,
              left: 20,
              zIndex: 3,
              height: 190,
              width: Dimensions.get('window').width - 40,
              backgroundColor: 'white',
              borderRadius: 5,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
            <View style={{ margin: 20 }}>
              <Text bold body1 style={{ marginBottom: 10 }}>
                {'Начать разговор'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row' }}>
                  <View
                    style={{
                      backgroundColor: 'white',
                      width: 60,
                      height: 60,
                      borderRadius: 60,
                      padding: 3,
                      alignItems: 'center',
                      justifyContent: 'center',
                      // position: 'absolute',
                      // top: 60,
                      // left: 80,
                    }}>
                    <Image
                      source={Images.avatar1}
                      style={{ width: 56, height: 56, borderRadius: 60 }}
                    />
                  </View>
                  <View
                    style={{
                      backgroundColor: 'white',
                      width: 60,
                      height: 60,
                      borderRadius: 60,
                      padding: 3,
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      position: 'absolute',
                      left: 25,
                    }}>
                    <Image
                      source={Images.avatar2}
                      style={{ width: 56, height: 56, borderRadius: 60 }}
                    />
                  </View>
                  <View
                    style={{
                      backgroundColor: 'white',
                      width: 60,
                      height: 60,
                      borderRadius: 60,
                      padding: 3,
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 3,
                      position: 'absolute',
                      left: 50,
                    }}>
                    <Image
                      source={Images.avatar3}
                      style={{ width: 56, height: 56, borderRadius: 60 }}
                    />
                  </View>
                </View>
                <View style={{ marginLeft: 60 }}>
                  <Text style={{ color: '#737376' }}>
                    {'Обычное время ответа'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FeatherIcon
                      name="clock"
                      size={16}
                      color={BaseColor.blueBackgroundColor}
                      style={{ marginRight: 5 }}
                    />
                    <Text bold>{'Несколько минут'}</Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  borderRadius: 40,
                  width: 180,
                  height: 50,
                  backgroundColor: BaseColor.blueBackgroundColor,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <FeatherIcon
                  name="send"
                  size={20}
                  color="white"
                  style={{ marginRight: 10 }}
                />
                <Text whiteColor>{'Напишите нам сообщение'}</Text>
              </View>
            </View>
          </View>

          <View
            style={{
              backgroundColor: '#99A4F1',
              position: 'absolute',
              top: 378,
              left: 20,
              zIndex: 2,
              height: 110,
              width: Dimensions.get('window').width - 40,
              borderRadius: 5,
            }}></View>
          <View
            style={{
              position: 'absolute',
              top: 380,
              left: 20,
              zIndex: 3,
              height: 110,
              width: Dimensions.get('window').width - 40,
              backgroundColor: 'white',
              borderRadius: 5,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
            <View style={{ margin: 20 }}>
              <Text bold body1 style={{ marginBottom: 10 }}>
                {'Найдите свой ответ сейчас'}
              </Text>
              <TextInput
                placeholder="Искать наши статьи"
                onChangeText={(text) => {
                  this.setState({ article: text });
                }}
              />
            </View>
          </View>

          <View
            style={{
              marginTop: 15,
              backgroundColor: BaseColor.whiteColor,
              height: 350,
            }}></View>
        </ScrollView>
      </RBSheet>
    );
  }

  render() {
    const { loading } = this.state;
    const { auth, navigation } = this.props;
    return (
      <>
        <Spinner visible={loading} color="#FF2D34" />

        {Platform.OS === 'ios' && (
          <View
            style={{
              height: getStatusBarHeight(true),
              backgroundColor: 'white',
            }}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
          </View>
        )}
        <TouchableOpacity onPress={this.onLogo} style={styles.drawerHeader}>
          <Logo width={54} height={54} />
          <View style={styles.drawerHeaderContent}>
            <Text style={styles.drawerHeaderText}>{'Local Market'}</Text>
          </View>
        </TouchableOpacity>
        <DrawerContentScrollView {...this.props}>
          <DrawerItem
            label="Адреса"
            labelStyle={{ marginLeft: -25, color: BaseColor.textPrimaryColor }}
            icon={({ focused, color, size }) => (
              <IoniconsIcon
                color={BaseColor.redColor}
                size={size}
                name="location-outline"
                style={styles.icon}
              />
            )}
            onPress={() => {
              navigation.navigate('Address1');
            }}
            activeTintColor={BaseColor.drawerTintColor}
          />
          <DrawerItem
            label="Заказы"
            labelStyle={{ marginLeft: -25, color: BaseColor.textPrimaryColor }}
            icon={({ focused, color, size }) => (
              <IoniconsIcon
                color={BaseColor.redColor}
                size={size}
                name="cube-outline"
                style={styles.icon}
              />
            )}
            onPress={() => {
              navigation.navigate('Orders', { from: 'DrawerContent' });
            }}
            activeTintColor={BaseColor.drawerTintColor}
          />
          <DrawerItem
            label="Профиль"
            labelStyle={{ marginLeft: -25, color: BaseColor.textPrimaryColor }}
            icon={({ focused, color, size }) => (
              <FeatherIcon
                color={BaseColor.redColor}
                size={size}
                name="user"
                style={styles.icon}
              />
            )}
            onPress={() => {
              this.onMyProfileBtn();
            }}
            activeTintColor={BaseColor.drawerTintColor}
          />
          <DrawerItem
            label="О сервисе"
            labelStyle={{ marginLeft: -25, color: BaseColor.textPrimaryColor }}
            icon={({ focused, color, size }) => (
              <FeatherIcon
                color={BaseColor.redColor}
                size={size}
                name="file-text"
                style={styles.icon}
              />
            )}
            onPress={() => {
              navigation.navigate('About');
            }}
            activeTintColor={BaseColor.drawerTintColor}
          />
        </DrawerContentScrollView>
        <TouchableOpacity
          onPress={this.onChatBtn}
          style={styles.versionContainer}>
          <ChatBox width={54} height={54} />
          <View style={{ marginLeft: 10, width: '70%' }}>
            <Text body1 style={{ color: BaseColor.textPrimaryColor }}>
              {'Чат поддержки'}
            </Text>
            <Text body2 grayColor>
              {'Позвоните или напишите нам'}
            </Text>
          </View>
        </TouchableOpacity>
        {this.renderChatPopup()}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(AuthActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DrawerContent);
