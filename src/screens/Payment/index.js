import React, {Component} from 'react';
import {connect} from 'react-redux';
import {AuthActions} from '@actions';
import {bindActionCreators} from 'redux';
import {
  View,
  TouchableOpacity,
  Platform,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {BaseStyle, BaseColor, BaseSize, Images} from '@config';
import {SafeAreaView, Text, Header, Icon} from '@components';
import styles from './styles';
import {withTranslation} from 'react-i18next';
import Spinner from 'react-native-loading-spinner-overlay';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import FeatherIcon from 'react-native-vector-icons/Feather';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useFocusEffect} from '@react-navigation/native';
import {UserServices} from '../../services';
import moment from 'moment-timezone';
import {WheelPicker} from 'react-native-wheel-picker-android';
import TinkoffASDK from 'react-native-tinkoff-asdk';
import {concat} from 'react-native-reanimated';

const DELIVERY_DAY = ['Cегодня', 'Завтра', '12 сентября'];

function FocusEfect({onFocus}) {
  useFocusEffect(
    React.useCallback(() => {
      onFocus();
      return;
    }, [onFocus]),
  );

  return null;
}

class Payment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deliveryAddress: null,
      deliveryTime: null,
      courierComment: null,
      comments: null,
      discountCode: null,
      loading: false,
      appliedStatus: false,
      selectedDateIndex: 0,
      selectedTimeIndex: 0,
      dateClicked: false,
      timeClicked: false,
      date: 'Cегодня',
      time: '',
      delivery_zone: {},
      selectedDay: 0,
      selectedTimeframe: null,
      errorPromocode: false,
      availableTimeframes: [],
      deliveryDays: ['Cегодня', 'Завтра', 'Послезавтра'],
      ind: 0,
      indToday: 0,
      cart: null,
    };
  }

  onFocus = () => {
    const {auth, navigation, actions, route} = this.props;

    if (route.params.cart === null) {
      this.setState({loading: true});
      UserServices.getCart(auth.user.access_token)
        .then((response) => {
          if (response.data.success === 1) {
            const cart = response.data.data.cart;
            this.setState({cart: cart});
          } else {
            console.error(
              'something went wrong while getting cart',
              response.data.message,
            );
            navigation.navigate('ErrorScreen', {
              message: response.data.message,
            });
          }
        })
        .catch((err) => {
          console.error('err in getting cart', err);
          navigation.navigate('ErrorScreen', {message: err.message});
        })
        .finally(() => {
          this.setState({loading: false});
        });
    } else {
      this.setState({cart: this.props.route.params.cart});
    }

    let myZone = '';
    if (
      auth.activeAddress.district !== null &&
      (auth.partner.delivery_zones !== null ||
        auth.partner.delivery_zones !== undefined)
    ) {
      if (
        auth.partner.delivery_zones.some(
          (zone) => zone.district === auth.activeAddress.district,
        )
      ) {
        myZone = auth.partner.delivery_zones.find(
          (zone) => zone.district === auth.activeAddress.district,
        );
      } else {
        myZone = auth.partner.delivery_zones.find(
          (zone) => zone.district === 'Выбрать все районы (Москва)\r\n',
        );
      }
    }
    var availableTimeframes = [];
    myZone?.delivery_timeframes.map((timeframe, index) => {
      if (this.checkIsBefore(timeframe) || this.checkIsBetween(timeframe)) {
        availableTimeframes.push(timeframe);
      }
    });
    availableTimeframes.sort((left, right) => {
      return (
        moment.utc(moment(left.start, 'HH:mm')) -
        moment.utc(moment(right.start, 'HH:mm'))
      );
    });
    this.setState({
      selectedTimeframe:
        availableTimeframes.length > 0
          ? availableTimeframes[0]
          : myZone?.delivery_timeframes[0],
    });
    if (availableTimeframes.length === 0) {
      this.setState({deliveryDays: ['Завтра', 'Послезавтра', '12 сентября']});
    }
    this.setState({availableTimeframes: availableTimeframes});
    this.setState({
      delivery_zone: myZone,
      time:
        availableTimeframes.length === 0
          ? 'с ' +
            myZone?.delivery_timeframes[0].start +
            ' до ' +
            myZone?.delivery_timeframes[0].end
          : 'с ' +
            availableTimeframes[0].start +
            ' до ' +
            availableTimeframes[0].end,
    });
    if (auth.user === null) {
      actions.setPaymentTrue();
      // Alert.alert('Хотите оплатить заказ?', 'Сначала войдите в систему.', [
      //   {
      //     text: 'Нет',
      //     onPress: () => {
      //       navigation.goBack();
      //     },
      //     style: 'cancel',
      //   },
      //   {
      //     text: 'Да',
      //     onPress: () => {
      //       navigation.push('SignIn', { from: 'PaymentSignIn' });
      //     },
      //   },
      // ]);
      navigation.push('SignIn', {from: 'PaymentSignIn'});
    } else {
      if (auth.addresses.length === 0) {
        Alert.alert(
          'Адреса пока нет',
          'Пожалуйста, сначала укажите свой адрес.',
          [
            {
              text: 'Нет',
              onPress: () => {
                navigation.goBack();
              },
              style: 'cancel',
            },
            {
              text: 'Да',
              onPress: () => {
                navigation.push('Main', {
                  screen: 'DrawerStack',
                  params: {screen: 'Address1', params: {from: 'Payment'}},
                });
              },
            },
          ],
        );
      } else {
        this.setState({
          deliveryAddress: auth.activeAddress.address,
          courierComment: auth.activeAddress.comment,
          loading: false,
        });
      }
    }
  };

  minutesOfDay = (m) => {
    return m.minutes() + m.hours() * 60;
  };

  checkIsBefore(timeframe) {
    var format = 'HH:mm';
    return (
      this.minutesOfDay(moment()) <
      this.minutesOfDay(moment(timeframe.start, format))
    );
  }

  checkIsBetween(timeframe) {
    var format = 'HH:mm';
    return (
      this.minutesOfDay(moment()) >
        this.minutesOfDay(moment(timeframe.start, format)) &&
      this.minutesOfDay(moment()) <
        this.minutesOfDay(moment(timeframe.end, format))
    );
  }

  onPayBtn = () => {
    const {
      comments,
      selectedTimeframe,
      selectedDay,
      appliedStatus,
      delivery_zone,
      cart,
    } = this.state;
    const _cart = cart.products;

    const {auth, actions, navigation} = this.props;
    let products = [];
    _cart
      .filter((val) => val.quantity > 0)
      .map((item, index) => {
        products = [...products, {id: item.productID, count: item.quantity}];
      });
    var myTime = moment();
    var orderPriceTmp =
      (appliedStatus
        ? (auth.totalPrice * (100 - auth.partner.promocode.discount)) / 100
        : auth.totalPrice) +
      (delivery_zone.free_delivery_from > auth.totalPrice
        ? delivery_zone?.delivery_price
        : 0);
    var items = [];
    products.forEach((product) => {
      var item = {};
      var productInfo = auth.products.find((val) => val.id === product.id);
      var prod_price =
        productInfo.hasPromo === 1
          ? productInfo.promo.new_price
          : productInfo.price;
      item['Name'] = productInfo.name;
      item['Price'] = appliedStatus
        ? prod_price * (100 - auth.partner.promocode.discount)
        : prod_price * 100;
      item['Quantity'] = product.count;
      item['Amount'] = prod_price * product.count * 100;
      item['Tax'] = 'none';
      items.push(item);
    });
    if (delivery_zone.free_delivery_from > auth.totalPrice) {
      var fee = {};
      fee['Name'] = 'Delivery Fee';
      fee['Price'] = delivery_zone?.delivery_price * 100;
      fee['Quantity'] = 1;
      fee['Amount'] = delivery_zone?.delivery_price * 100;
      fee['Tax'] = 'none';
      items.push(fee);
    }

    TinkoffASDK.init({
      // Тестовые данные из https://github.com/TinkoffCreditSystems/tinkoff-asdk-android/blob/9c7d1727f2ba5d715f240e0be6e4a0fd8b88a1db/sample/src/main/java/ru/tinkoff/acquiring/sample/SessionParams.java
      terminalKey: '1611068012288DEMO',
      password: 'n0q11yb653s13fgc',
      publicKey:
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv5yse9ka3ZQE0feuGtemYv3IqOlLck8zHUM7lTr0za6lXTszRSXfUO7jMb+L5C7e2QNFs+7sIX2OQJ6a+HG8kr+jwJ4tS3cVsWtd9NXpsU40PE4MeNr5RqiNXjcDxA+L4OsEm/BlyFOEOh2epGyYUd5/iO3OiQFRNicomT2saQYAeqIwuELPs1XpLk9HLx5qPbm8fRrQhjeUD5TLO8b+4yCnObe8vy/BMUwBfq+ieWADIjwWCMp2KTpMGLz48qnaD9kdrYJ0iyHqzb2mkDhdIzkim24A3lWoYitJCBrrB2xM05sm9+OdCI1f7nPNJbl5URHobSwR94IRGT7CJcUjvwIDAQAB',
      testMode: false,
      debugLog: true,
    });
    if (Platform.OS === 'ios') {
      TinkoffASDK.isPayWithAppleAvailable()
        .then((response) => {
          console.log('____hasApplePay', response);
          if (response) {
            const payment = TinkoffASDK.ApplePay({
              appleMerchantId: 'merchant.local-market',
              Phone: '+79998881111',
              Shipping: {
                Street: 'Головинское шоссе, дом 5, корп. 1',
                Country: 'Россия',
                City: 'Москва',
                PostalCode: '125212',
                ISOCountryCode: '643',
                givenName: 'имя',
                familyName: 'фамилия',
              },
              // Все то же что в простом Pay
              OrderID: Math.abs(new Date().getTime()).toString(10), // ID заказа в вашей системе
              Amount: orderPriceTmp * 100, // сумма для оплаты (в копейках)
              PaymentName: auth.partner.name, // название платежа, видимое пользователю
              PaymentDesc: auth.partner.description, // описание платежа, видимое пользователю
              CardID: 'CARD-ID', // ID карточки
              // тестовые:
              Email: 'team.local.market@gmail.com',
              CustomerKey: 'team.local.market@gmail.com',
              IsRecurrent: false, // флаг определяющий является ли платеж рекуррентным [1]
              UseSafeKeyboard: true, // флаг использования безопасной клавиатуры [2]
              Taxation: 'usn_income',
              Items: items,
            });

            payment
              .then((r) => {
                const body = {
                  user_address_id: auth.activeAddress.id,
                  company_id: auth.partner.id,
                  order_date: myTime.tz('Europe/Moscow').format('YYYY-MM-DD'),
                  delivery_timeframe: selectedTimeframe,
                  delivery_day: selectedDay,
                  order_price: orderPriceTmp,
                  order_original_price:
                    delivery_zone.free_delivery_from > auth.totalPrice
                      ? auth.totalPrice + delivery_zone?.delivery_price
                      : auth.totalPrice,
                  products: products,
                  comment: comments,
                };
                this.setState({loading: true});
                UserServices.addOrder(body, auth.user.access_token)
                  .then((response) => {
                    if (response.data.success === 1) {
                      // actions.clearCart();
                      // clear cart
                      this.setState({loading: true});
                      UserServices.clearCart(auth.user.access_token, cart.id)
                        .then((response) => {
                          if (response.data.success === 1) {
                            actions.clearTotalPrice();
                            actions.clearDiscountPrice();
                            // actions.clearPartner();
                            this.setState({
                              courierComment: null,
                              deliveryTime: null,
                              comments: null,
                            });
                            this.setState({loading: true});
                            UserServices.getOrder(auth.user.access_token)
                              .then((response) => {
                                if (response.data.success === 1) {
                                  navigation.navigate('OrdersStatus', {
                                    id: response.data.data[0].id,
                                  });
                                } else {
                                  console.error(
                                    'sth wrong in getOrder',
                                    response.data.message,
                                  );
                                  navigation.navigate('ErrorScreen', {
                                    message: response.data.message,
                                  });
                                }
                              })
                              .catch((err) => {
                                console.error('err in getOrder', err);
                                navigation.navigate('ErrorScreen', {
                                  message: err.message,
                                });
                              })
                              .finally(() => {
                                this.setState({loading: false});
                              });
                          } else {
                            console.error(
                              'something went wrong while clearing cart',
                              response.data.message,
                            );
                            navigation.navigate('ErrorScreen', {
                              message: response.data.message,
                            });
                          }
                        })
                        .catch((err) => {
                          console.error('err in clearing cart_3', err);
                          navigation.navigate('ErrorScreen', {
                            message: err.message,
                          });
                        })
                        .finally(() => {
                          // this.setState({ loading: false });
                        });
                    } else {
                      console.error(
                        'something went wrong in adding order',
                        response.data.message,
                      );
                      navigation.navigate('ErrorScreen', {
                        message: response.data.message,
                      });
                    }
                  })
                  .catch((err) => {
                    console.error('err in adding Order', err);
                    navigation.navigate('ErrorScreen', {message: err.message});
                  })
                  .finally(() => {
                    this.setState({loading: false});
                  });
              })
              .catch((e) => {
                console.error('_err_payment', e);
              });
          } else {
            Alert.alert('Applepay в данный момент недоступен');
          }
        })
        .catch((err) => {
          console.error('_err_ios_available', err);
        });
    } else {
      // tinkoff payment -------------------------------------------------------------------------------
      const payment = TinkoffASDK.Pay({
        OrderID: Math.abs(new Date().getTime()).toString(10), // ID заказа в вашей системе
        Amount: orderPriceTmp * 100, // сумма для оплаты (в копейках)
        PaymentName: auth.partner.name, // название платежа, видимое пользователю
        PaymentDesc: auth.partner.description, // описание платежа, видимое пользователю
        CardID: 'CARD-ID', // ID карточки
        // тестовые:
        Email: 'team.local.market@gmail.com',
        CustomerKey: 'team.local.market@gmail.com',
        IsRecurrent: false, // флаг определяющий является ли платеж рекуррентным [1]
        UseSafeKeyboard: true, // флаг использования безопасной клавиатуры [2]
        GooglePayParams: {
          MerchantName: 'test',
          AddressRequired: false,
          PhoneRequired: false,
          Environment: 'TEST', // "SANDBOX", "PRODUCTION"
        },
        Taxation: 'usn_income',
        Items: items,
        // Items: [
        //   {
        //     Name: "test 1",
        //     Price: 10000, // В копейках (100 рублей)
        //     Quantity: 2,
        //     Amount: 20000, // В копейках (200 рублей)
        //     Tax: 'none',
        //   },
        //   {
        //     Name: "test 2",
        //     Price: 12345,
        //     Quantity: 1,
        //     Amount: 12345,
        //     Tax: "none",
        //   }
        // ],
      });
      payment
        .then((r) => {
          const body = {
            user_address_id: auth.activeAddress.id,
            company_id: auth.partner.id,
            order_date: myTime.tz('Europe/Moscow').format('YYYY-MM-DD'),
            delivery_timeframe: selectedTimeframe,
            delivery_day: selectedDay,
            order_price: orderPriceTmp,
            order_original_price:
              delivery_zone.free_delivery_from > auth.totalPrice
                ? auth.totalPrice + delivery_zone?.delivery_price
                : auth.totalPrice,
            products: products,
            comment: comments,
          };
          this.setState({loading: true});
          UserServices.addOrder(body, auth.user.access_token)
            .then((response) => {
              if (response.data.success === 1) {
                // actions.clearCart();
                // clear cart
                this.setState({loading: true});
                UserServices.clearCart(auth.user.access_token, cart.id)
                  .then((response) => {
                    if (response.data.success === 1) {
                      actions.clearTotalPrice();
                      actions.clearDiscountPrice();
                      // actions.clearPartner();
                      this.setState({
                        courierComment: null,
                        deliveryTime: null,
                        comments: null,
                      });
                      this.setState({loading: true});
                      UserServices.getOrder(auth.user.access_token)
                        .then((response) => {
                          if (response.data.success === 1) {
                            navigation.navigate('OrdersStatus', {
                              id: response.data.data[0].id,
                            });
                          } else {
                            console.error(
                              'sth wrong in getOrder',
                              response.data.message,
                            );
                            navigation.navigate('ErrorScreen', {
                              message: response.data.message,
                            });
                          }
                        })
                        .catch((err) => {
                          console.error('err in getOrder', err);
                          navigation.navigate('ErrorScreen', {
                            message: err.message,
                          });
                        })
                        .finally(() => {
                          this.setState({loading: false});
                        });
                    } else {
                      console.error(
                        'something went wrong while clearing cart',
                        response.data.message,
                      );
                      navigation.navigate('ErrorScreen', {
                        message: response.data.message,
                      });
                    }
                  })
                  .catch((err) => {
                    console.error('err in clearing cart_4', err);
                    navigation.navigate('ErrorScreen', {message: err.message});
                  })
                  .finally(() => {
                    // this.setState({ loading: false });
                  });
              } else {
                console.error(
                  'something went wrong in adding order',
                  response.data.message,
                );
                navigation.navigate('ErrorScreen', {
                  message: response.data.message,
                });
              }
            })
            .catch((err) => {
              console.error('err in adding Order', err);
              navigation.navigate('ErrorScreen', {message: err.message});
            })
            .finally(() => {
              this.setState({loading: false});
            });
        })
        .catch((e) => {
          console.error('_err_payment', e);
        });
    }

    // -----------------------------------------------
  };

  checkInput = () => {
    const {deliveryAddress, date, time} = this.state;
    if (deliveryAddress && date && time) return true;
    else return false;
  };

  onDateBtn = (item, index) => {
    this.setState({
      selectedDateIndex: index,
      dateClicked: true,
      date: item,
    });
  };

  onTimeBtn = (item, index) => {
    this.setState({
      selectedTimeIndex: index,
      timeClicked: true,
      time: item.start + ' до ' + item.end,
    });
  };

  onDaySelected = (selectedDay) => {
    this.setState({selectedDay});
    const {
      availableTimeframes,
      deliveryDays,
      delivery_zone,
      ind,
      indToday,
    } = this.state;
    var timeframesForToday = [];
    if (availableTimeframes.length !== 0) {
      availableTimeframes.map((item, index) => {
        timeframesForToday.push('с ' + item.start + ' до ' + item.end);
      });
    }
    if (
      deliveryDays[selectedDay] === DELIVERY_DAY[0] &&
      timeframesForToday.length !== 0
    ) {
      this.setState({selectedTimeframe: availableTimeframes[indToday]});
    } else {
      if (delivery_zone !== undefined) {
        this.setState({
          selectedTimeframe: delivery_zone.delivery_timeframes[ind],
        });
      }
    }
  };

  onTimeframeSelectedForToday = (ind) => {
    this.setState({
      selectedTimeframe: this.state.availableTimeframes[ind],
      indToday: ind,
    });
  };

  onTimeframeSelectedForTomorrow = (ind) => {
    this.setState({
      selectedTimeframe: this.state.delivery_zone.delivery_timeframes[ind],
      ind: ind,
    });
  };

  renderDatePopup() {
    const {
      delivery_zone,
      selectedDay,
      availableTimeframes,
      deliveryDays,
      ind,
      indToday,
    } = this.state;
    let timeframesForToday = [];
    let timeframesForTomorrow = [];
    if (delivery_zone.delivery_timeframes !== undefined) {
      delivery_zone?.delivery_timeframes.map((item, index) => {
        timeframesForTomorrow.push('с ' + item.start + ' до ' + item.end);
      });
    }
    if (availableTimeframes.length !== 0) {
      availableTimeframes.map((item, index) => {
        timeframesForToday.push('с ' + item.start + ' до ' + item.end);
      });
    }

    const {auth} = this.props;
    return (
      <RBSheet
        ref={(ref) => {
          this.DateSheet = ref;
        }}
        height={300}
        closeOnDragDown={true}
        dragFromTopOnly={true}
        openDuration={500}
        customStyles={{
          container: {
            backgroundColor: 'white',
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
          },
        }}>
        <ScrollView style={{paddingHorizontal: 20}}>
          <View style={{marginTop: 15}}>
            <Text title3>{'Укажите промежуток доставки'}</Text>
          </View>
          {auth.partner !== null &&
          auth.partner?.delivery_zones.length !== 0 ? (
            <View style={{flexDirection: 'row', marginTop: 15}}>
              <View style={{width: '50%'}}>
                <WheelPicker
                  selectedItem={selectedDay}
                  data={deliveryDays}
                  onItemSelected={this.onDaySelected}
                />
              </View>
              <View style={{width: '50%'}}>
                {deliveryDays[selectedDay] === DELIVERY_DAY[0] &&
                timeframesForToday.length !== 0 ? (
                  <WheelPicker
                    selectedItem={indToday}
                    data={timeframesForToday}
                    onItemSelected={this.onTimeframeSelectedForToday}
                  />
                ) : deliveryDays[selectedDay] === DELIVERY_DAY[0] &&
                  timeframesForToday.length === 0 ? (
                  <></>
                ) : (
                  <WheelPicker
                    selectedItem={ind}
                    data={timeframesForTomorrow}
                    onItemSelected={this.onTimeframeSelectedForTomorrow}
                  />
                )}
              </View>
            </View>
          ) : (
            <Text>
              {
                'Сроки доставки не указаны для этого партнера, повторите попытку позже.'
              }
            </Text>
          )}
        </ScrollView>
      </RBSheet>
    );
  }

  onApplyBtn = () => {
    const {discountCode} = this.state;
    const {auth} = this.props;
    if (
      auth.partner.promocode !== null &&
      auth.partner.promocode.code === discountCode
    ) {
      this.setState({appliedStatus: true, errorPromocode: false});
    } else {
      this.setState({errorPromocode: true});
    }
  };

  render() {
    const {
      loading,
      appliedStatus,
      deliveryAddress,
      dateClicked,
      timeClicked,
      date,
      time,
      comments,
      delivery_zone,
      selectedDay,
      selectedTimeframe,
      errorPromocode,
      deliveryDays,
    } = this.state;
    return (
      <>
        <FocusEfect onFocus={this.onFocus} />
        <SafeAreaView
          style={BaseStyle.safeAreaView}
          forceInset={{top: 'never'}}>
          <Spinner visible={loading} color="#FF2D34" />
          <View style={styles.contain}>
            <Header
              title={'Оплата'}
              renderLeft={() => {
                return (
                  <FeatherIcon
                    name="chevron-left"
                    size={BaseSize.headerIconSize}
                    color={BaseColor.redColor}
                  />
                );
              }}
              onPressLeft={() => {
                this.props.navigation.goBack();
              }}
            />
            {delivery_zone !== {} && (
              <KeyboardAwareScrollView
                style={styles.mainContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Text body2 lightGrayColor>
                  {'Адрес доставки'}
                </Text>
                <Text style={styles.address}>{deliveryAddress}</Text>
                <Text body2 lightGrayColor>
                  {'Время доставки'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    this.DateSheet.open();
                  }}
                  style={{
                    backgroundColor: BaseColor.textInputBackgroundColor,
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    borderRadius: 5,
                    marginTop: 5,
                    marginBottom: 10,
                  }}>
                  {dateClicked && timeClicked ? (
                    <Text
                      style={{
                        fontSize: 16,
                        color: BaseColor.textPrimaryColor,
                      }}>
                      {date + ', ' + time}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: 16,
                        color: BaseColor.textPrimaryColor,
                      }}>
                      {delivery_zone?.delivery_timeframes &&
                        deliveryDays[selectedDay] +
                          ', ' +
                          selectedTimeframe?.start +
                          ' до ' +
                          selectedTimeframe?.end}
                    </Text>
                  )}
                </TouchableOpacity>
                <Text body2 lightGrayColor>
                  {'Комментарий к заказу'}
                </Text>
                <TextInput
                  value={comments}
                  placeholder="Укажите комментарий"
                  placeholderTextColor={BaseColor.textInputPlaceholderColor}
                  style={styles.textInput}
                  onChangeText={(text) => {
                    this.setState({comments: text});
                  }}
                />
                <Text body2 lightGrayColor>
                  {'Промокод'}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    // alignItems: 'center',
                  }}>
                  <View style={{flex: 6}}>
                    <TextInput
                      placeholder="Укажите промокод"
                      placeholderTextColor={BaseColor.textInputPlaceholderColor}
                      style={styles.textInput}
                      onChangeText={(text) => {
                        this.setState({discountCode: text});
                      }}
                    />
                  </View>
                  {appliedStatus ? (
                    <View
                      style={[
                        {
                          backgroundColor: BaseColor.redColor,
                        },
                        styles.discountBtn,
                      ]}>
                      <FeatherIcon name="check" size={21} color={'white'} />
                    </View>
                  ) : (
                    <View
                      style={[
                        {
                          borderWidth: 1,
                          borderColor: BaseColor.redColor,
                        },
                        styles.discountBtn,
                      ]}>
                      <TouchableOpacity
                        onPress={() => {
                          this.onApplyBtn();
                        }}>
                        <Text redColor style={{textAlign: 'center'}}>
                          {'Применить'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {errorPromocode && (
                  <View style={{width: '65%'}}>
                    <Text body2 style={{color: '#5858589E'}}>
                      {
                        'Данного промокода не существует,или он уже был использован'
                      }
                    </Text>
                  </View>
                )}
              </KeyboardAwareScrollView>
            )}
            <View style={styles.bottomContainer}>
              <TouchableOpacity
                onPress={this.onPayBtn}
                disabled={!this.checkInput()}
                style={[
                  styles.saveBtn,
                  this.checkInput()
                    ? {backgroundColor: BaseColor.redColor}
                    : {backgroundColor: BaseColor.textInputBackgroundColor},
                ]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {/* <Icon
                    name="apple-pay"
                    size={20}
                    color={
                      this.checkInput()
                        ? BaseColor.whiteColor
                        : BaseColor.textPrimaryColor
                    }
                    style={{
                      borderWidth: 1,
                      borderColor: this.checkInput()
                        ? BaseColor.whiteColor
                        : BaseColor.textPrimaryColor,
                      marginRight: 5,
                      paddingHorizontal: 5,
                      paddingVertical: 2,
                      borderRadius: 5,
                    }}
                  /> */}
                  <Text
                    middleBody
                    style={
                      this.checkInput()
                        ? {color: BaseColor.whiteColor}
                        : {color: BaseColor.redColor}
                    }>
                    {'Оплатить заказ'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
        {this.renderDatePopup()}
      </>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(Payment));
