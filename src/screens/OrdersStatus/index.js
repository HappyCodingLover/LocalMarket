import React, {Component} from 'react';
import {connect} from 'react-redux';
import {AuthActions} from '@actions';
import {View, Dimensions, Alert, ImageBackground} from 'react-native';
import {bindActionCreators} from 'redux';
import {Icon, Header, Image, Text, TextInput, SafeAreaView} from '@components';
import styles from './styles';
import {BaseColor, Images, BaseSize} from '@config';
import FeatherIcon from 'react-native-vector-icons/Feather';
import ChatBox from '../../assets/svgs/chatbox.svg';
import Bonus from '../../assets/svgs/bonus.svg';
import OrderCancelled from '../../assets/svgs/orderCancelled.svg';
import OrderCreated from '../../assets/svgs/orderCreated.svg';
import OrderPacked from '../../assets/svgs/orderPacked.svg';
import OrderOnDelivery from '../../assets/svgs/orderOnDelivery.svg';
import OrderDelivered from '../../assets/svgs/orderDelivered.svg';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import RBSheet from 'react-native-raw-bottom-sheet';
import Emoji from 'react-native-emoji';
import {useFocusEffect} from '@react-navigation/native';
import {UserServices} from '../../services';
import Spinner from 'react-native-loading-spinner-overlay';
import {AndroidBackHandler} from 'react-navigation-backhandler';
import moment from 'moment-timezone';

function FocusEfect({onFocus}) {
  useFocusEffect(
    React.useCallback(() => {
      onFocus();
      return;
    }, [onFocus]),
  );

  return null;
}

class OrdersStatus extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      loaded: false,
      order: null,
      article: '',
      messages: [
        {
          id: 0,
          status: 'Создан',
          msg: 'Заказ создан',
          text: 'Мы сообщим, когда его начнут собирать',
        },
        {
          id: 1,
          status: 'Принят',
          msg: 'Заказ принят',
          text: 'Мы сообщим, когда его начнут собирать',
        },
        {
          id: 2,
          status: 'Собирается',
          msg: 'Заказ собирается',
          text: 'Мы сообщим, когда его передадут в доставку',
        },
        {
          id: 3,
          status: 'У курьера',
          msg: 'Заказ у курьера',
          text: 'Курьер скоро свяжется с вами',
        },
        {
          id: 4,
          status: 'Доставлен',
          msg: 'Заказ доставлен',
          text: 'Спасибо за покупку!',
        },
        {
          id: 5,
          status: 'Отменен',
          msg: 'Заказ был отменен',
          text:
            'Ваш заказ был отменен, свяжитесь с нами, если возникли вопросы',
        },
      ],
    };
  }

  onFocus = () => {
    const {auth, route} = this.props;
    const {navigation} = this.props;
    this.setState({loading: true});
    UserServices.getOrderById(auth.user.access_token, route.params.id)
      .then((response) => {
        if (response.data.success === 1) {
          this.setState({order: response.data.data}, () => {
            this.setState({loaded: true});
          });
        } else {
          console.error(
            'something went wrong while getting order details',
            response.data.message,
          );
          navigation.navigate('ErrorScreen', {
            message: response.data.message,
          });
        }
      })
      .catch((err) => {
        console.error('err in getting order details', err);
        navigation.navigate('ErrorScreen', {
          message: err.message,
        });
      })
      .finally(() => {
        this.setState({loading: false});
      });
  };

  onChatBtn = () => {
    this.ChatSheet.open();
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
          <View style={{marginTop: 15, height: 200}}>
            <View>
              <View style={{marginHorizontal: 40}}>
                <Icon name="intercom" size={30} color={BaseColor.whiteColor} />
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <Text title1 whiteColor>
                    {'Привет'}
                  </Text>
                  <Emoji name="wave" style={{fontSize: 25, marginLeft: 5}} />
                </View>
                <Text whiteColor style={{marginTop: 10}}>
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
              height: 240,
              width: Dimensions.get('window').width - 40,
              borderRadius: 5,
            }}></View>
          <View
            style={{
              position: 'absolute',
              top: 160,
              left: 20,
              zIndex: 3,
              height: 240,
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
            <View style={{margin: 20}}>
              <Text bold body1 style={{marginBottom: 10}}>
                {'Начать разговор'}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={{flexDirection: 'row'}}>
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
                      style={{width: 56, height: 56, borderRadius: 60}}
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
                      style={{width: 56, height: 56, borderRadius: 60}}
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
                      style={{width: 56, height: 56, borderRadius: 60}}
                    />
                  </View>
                </View>
                <View style={{marginLeft: 60}}>
                  <Text style={{color: '#737376'}}>
                    {'Обычное время ответа'}
                  </Text>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <FeatherIcon
                      name="clock"
                      size={16}
                      color={BaseColor.blueBackgroundColor}
                      style={{marginRight: 5}}
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
                  size={BaseSize.headerIconSize}
                  color="white"
                  style={{marginRight: 10}}
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
            <View style={{margin: 20}}>
              <Text bold body1 style={{marginBottom: 10}}>
                {'Найдите свой ответ сейчас'}
              </Text>
              <TextInput
                placeholder="Искать наши статьи"
                onChangeText={(text) => {
                  this.setState({article: text});
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

  minutesOfDay = (m) => {
    return m.minutes() + m.hours() * 60;
  };

  checkIsBetween(timeframe) {
    var format = 'HH:mm';

    return (
      this.minutesOfDay(moment()) >
        this.minutesOfDay(moment(timeframe.start, format)) &&
      this.minutesOfDay(moment()) <
        this.minutesOfDay(moment(timeframe.end, format))
    );
  }

  filterBreakTimes = (partner) => {
    let flag = false;
    flag = false;
    if (partner.timeframes[0].break_times.length > 0) {
      partner.timeframes[0].break_times.map((timeframe) => {
        if (this.checkIsBetween(timeframe)) {
          flag = true;
        }
      });
    }
    return flag === false;
  };

  render() {
    const {order, messages, loading, loaded} = this.state;
    const {navigation, actions} = this.props;
    return (
      <AndroidBackHandler
        onBackPress={() => {
          this.props.navigation.navigate('Main', {
            screen: 'DrawerStack',
            params: {screen: 'Orders'},
          });
          return true;
        }}>
        <FocusEfect onFocus={this.onFocus} />
        <SafeAreaView style={styles.contain} forceInset={{top: 'never'}}>
          <Spinner visible={loading} color="#FF2D34" />
          <Header
            title="Статус заказа"
            renderLeft={() => {
              return (
                <FeatherIcon
                  name="menu"
                  size={BaseSize.headerMenuIconSize}
                  color={BaseColor.redColor}
                />
              );
            }}
            onPressLeft={() => {
              this.props.navigation.openDrawer();
            }}
            style={{backgroundColor: BaseColor.grayBackgroundColor}}
            statusBarColor={BaseColor.grayBackgroundColor}
          />
          {loaded && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{marginHorizontal: 20}}>
              {/* order details */}
              <TouchableOpacity
                onPress={() => {
                  if (order.company.blocked === 1) {
                    Alert.alert(
                      'Эта компания находится в архиве',
                      'Пожалуйста, повторите попытку позже',
                      [
                        {
                          text: 'Нет',
                          onPress: () => {},
                          style: 'cancel',
                        },
                        {
                          text: 'Да',
                          onPress: () => {},
                        },
                      ],
                    );
                  } else {
                    actions.setPartner(order.company);
                    if (this.filterBreakTimes(order.company)) {
                      navigation.navigate('ProductDetail', {
                        from: 'OrderStatus',
                      });
                    } else {
                      Alert.alert('', 'Извините, но эта компания не работает', [
                        {
                          text: 'Да',
                          onPress: () => {},
                        },
                      ]);
                    }
                  }
                }}
                style={styles.order}>
                <View style={styles.orderItem}>
                  <ImageBackground
                    source={Images.productPlaceholder}
                    imageStyle={{borderRadius: 10}}
                    style={styles.orderItemImg}>
                    <Image
                      source={{uri: order.company.logo_url}}
                      style={styles.orderItemImg}
                    />
                  </ImageBackground>
                  <View style={styles.orderImageInfo}>
                    <View style={styles.orderInfo}>
                      <Text body1 numberOfLines={2}>
                        {order.company.name}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              {/* order status text */}
              <View>
                <Text title1>
                  {messages.find((v) => v.id === order.status).msg}
                </Text>
                <Text
                  middleBody
                  style={{color: BaseColor.grayColor, marginVertical: 10}}>
                  {messages.find((v) => v.id === order.status).text}
                </Text>
              </View>
              <View style={{marginTop: 55}}>
                {/* order status bar */}
                <View>
                  {order.status !== 5 ? (
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderColor: BaseColor.redColor,
                        width: Dimensions.get('window').width - 50,
                        height: 0,
                        marginHorizontal: 5,
                      }}></View>
                  ) : (
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderColor: BaseColor.redColor,
                        width: Dimensions.get('window').width / 2 - 75,
                        height: 0,
                        marginHorizontal: 5,
                      }}></View>
                  )}
                  {(order.status === 0 || order.status === 1) && (
                    <View
                      style={{
                        zIndex: 2,
                        position: 'absolute',
                        bottom: -24,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: 'white',
                            marginRight:
                              (Dimensions.get('window').width - 240) / 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="check"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: BaseColor.grayBackgroundColor,
                            marginRight:
                              (Dimensions.get('window').width - 240) / 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="box"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: BaseColor.grayBackgroundColor,
                            marginRight:
                              (Dimensions.get('window').width - 240) / 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="arrow-right"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: BaseColor.grayBackgroundColor,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="flag"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                  {order.status === 2 && (
                    <View
                      style={{
                        zIndex: 2,
                        position: 'absolute',
                        // left: 0,
                        bottom: -24,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: 'white',
                            marginRight:
                              (Dimensions.get('window').width - 240) / 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="check"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: 'white',
                            marginRight:
                              (Dimensions.get('window').width - 240) / 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="check"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: BaseColor.grayBackgroundColor,
                            marginRight:
                              (Dimensions.get('window').width - 240) / 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="arrow-right"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: BaseColor.grayBackgroundColor,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="flag"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                  {order.status === 3 && (
                    <View
                      style={{
                        zIndex: 2,
                        position: 'absolute',
                        // left: 0,
                        bottom: -24,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: 'white',
                            marginRight:
                              (Dimensions.get('window').width - 240) / 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="check"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: 'white',
                            marginRight:
                              (Dimensions.get('window').width - 240) / 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="check"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: 'white',
                            marginRight:
                              (Dimensions.get('window').width - 240) / 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="check"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: BaseColor.grayBackgroundColor,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="flag"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                  {order.status === 4 && (
                    <View
                      style={{
                        zIndex: 2,
                        position: 'absolute',
                        // left: 0,
                        bottom: -24,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: 'white',
                            marginRight:
                              (Dimensions.get('window').width - 240) / 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="check"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: 'white',
                            marginRight:
                              (Dimensions.get('window').width - 240) / 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="check"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: 'white',
                            marginRight:
                              (Dimensions.get('window').width - 240) / 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="check"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: 'white',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="check"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                  {order.status === 5 && (
                    <View
                      style={{
                        zIndex: 2,
                        position: 'absolute',
                        // left: 0,
                        bottom: -24,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: 'white',
                            marginRight:
                              (Dimensions.get('window').width - 240) / 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="check"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: BaseColor.redColor,
                            backgroundColor: 'white',
                            marginRight:
                              (Dimensions.get('window').width - 240) / 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <FeatherIcon
                            name="x"
                            size={BaseSize.headerIconSize}
                            color={BaseColor.textPrimaryColor}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                </View>
                {/* order status image */}
                <View style={{marginTop: 30}}>
                  {order.status === 4 ? (
                    <OrderDelivered
                      width={Dimensions.get('window').width - 140}
                      height={Dimensions.get('window').width - 140}
                      style={{alignSelf: 'center'}}
                    />
                  ) : order.status === 5 ? (
                    <OrderCancelled
                      width={Dimensions.get('window').width - 140}
                      height={Dimensions.get('window').width - 140}
                      style={{alignSelf: 'center'}}
                    />
                  ) : order.status === 0 || order.status === 1 ? (
                    <OrderCreated
                      width={Dimensions.get('window').width - 140}
                      height={Dimensions.get('window').width - 140}
                      style={{alignSelf: 'center'}}
                    />
                  ) : order.status === 3 ? (
                    <OrderOnDelivery
                      width={Dimensions.get('window').width - 140}
                      height={Dimensions.get('window').width - 140}
                      style={{alignSelf: 'center'}}
                    />
                  ) : (
                    <OrderPacked
                      width={Dimensions.get('window').width - 140}
                      height={Dimensions.get('window').width - 140}
                      style={{alignSelf: 'center'}}
                    />
                  )}
                </View>
              </View>
              <View style={{marginVertical: 30}}>
                {order.status === 4 && (
                  <TouchableOpacity onPress={this.onChatBtn}>
                    <View style={styles.bonus}>
                      <View style={styles.bonusSvg}>
                        <Bonus width={54} height={54} />
                      </View>
                      <View style={styles.bonusText}>
                        <Text body1>{'Для вас доступен бонус'}</Text>
                        <View style={{flexDirection: 'row'}}>
                          <Text
                            body2
                            grayColor
                            numberOfLines={4}
                            style={{flex: 1, flexWrap: 'wrap'}}>
                            {
                              'Напишите в чат поддержки, \nи мы предоставим вам персональную скидку или подарок'
                            }
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={this.onChatBtn}
                  style={styles.chatBox}>
                  <View style={styles.chatBoxSvg}>
                    <ChatBox width={54} height={54} />
                  </View>
                  <View style={styles.chatBoxText}>
                    <Text body1>{'Чат поддержки'}</Text>
                    <Text body2 grayColor>
                      {'Позвоните нам или напишите нам!'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
          {this.renderChatPopup()}
        </SafeAreaView>
      </AndroidBackHandler>
    );
  }
}

const mapStateToProps = (state) => {
  return {auth: state.auth};
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(AuthActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OrdersStatus);
