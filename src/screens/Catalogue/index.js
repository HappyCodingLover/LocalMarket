import React, {Component} from 'react';
import {connect} from 'react-redux';
import {AuthActions} from '@actions';
import {
  FlatList,
  View,
  Dimensions,
  Alert,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import {bindActionCreators} from 'redux';
import {Text, Header, PartnerItem, SafeAreaView} from '@components';
import styles from './styles';
import {BaseColor, BaseSize, Images} from '@config';
import {useFocusEffect} from '@react-navigation/native';
import NoPartners from '../../assets/svgs/noPartners.svg';
import {GuestServices, UserServices} from '../../services';
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade,
} from 'rn-placeholder';
import moment from 'moment-timezone';

import Feather from 'react-native-vector-icons/Feather';
import SvgCssUri from 'react-native-svg';
import {ScrollView} from 'react-native-gesture-handler';
import {AndroidBackHandler} from 'react-navigation-backhandler';

function FocusEfect({onFocus}) {
  useFocusEffect(
    React.useCallback(() => {
      onFocus();
      return;
    }, [onFocus]),
  );

  return null;
}

class Catalogue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingArticles: false,
      loadingPartners: false,
      loadingCategories: false,
      title: '',
      svgSize: Dimensions.get('window').width - 200,
      showAlert: false,
      selectedIndex: 0,
      articles: [],
      categories: [],
      selectedCategoryIndex: 100000,
      locationPermissionStatus: false,
      delivery_zone: {},
      cats: [],
      cart: null,
      products: [],
    };
  }

  getCart = () => {
    const {auth, actions} = this.props;
    this.setState({loadingPartners: true});
    UserServices.getCart(auth?.user?.access_token)
      .then((response) => {
        if (response.data.success === 1) {
          const cart = response.data.data?.cart;
          if (cart === null) {
            actions.saveTotalPrice(0);
          } else {
            var totalPrice = 0;
            this.setState({loadingPartners: true});
            GuestServices.getCatalogueById(cart?.company_id)
              .then((response) => {
                if (response.data.success === 1) {
                  GuestServices.getAllPartners(
                    undefined,
                    auth?.activeAddress?.district,
                  ).then((response) => {
                    if (response.data.success === 1) {
                      const partners = response.data.data?.data;
                      const partner = partners.find(
                        (partner) => partner?.id === cart?.company_id,
                      );
                      actions.setPartner(partner);
                      this.getDeliveryZone();
                    }
                  });
                  actions.saveProducts(response.data.data?.products);
                  cart?.products.forEach((product) => {
                    var itemInfo = undefined;
                    response.data.data?.products.forEach((item) => {
                      if (product?.productID === item?.id) {
                        itemInfo = item;
                      }
                    });

                    var price =
                      itemInfo !== undefined
                        ? itemInfo?.hasPromo === 1
                          ? itemInfo?.promo?.new_price
                          : itemInfo?.price
                        : 0;
                    totalPrice = parseFloat(
                      (totalPrice + price * product?.quantity).toFixed(2),
                    );
                  });
                } else {
                  console.error(
                    'something went wrong while getting partner by id',
                    response.data.message,
                  );
                }
              })
              .catch((err) => {
                console.error('err in getting partner', err);
              })
              .finally(() => {
                this.setState({loadingPartners: false});
                actions.saveTotalPrice(totalPrice);
              });
          }
          this.setState({cart: cart});
        } else {
          console.error(
            'something went wrong while getting cart',
            response.data.message,
          );
        }
      })
      .catch((err) => {
        console.error('err in getting cart', err);
      })
      .finally(() => {
        this.setState({loadingPartners: false});
      });
  };

  onRegister(token) {
    this.setState({registerToken: token?.token, fcmRegistered: true});
  }

  onNotif(notif) {
    Alert.alert(notif?.title, notif?.message);
  }

  handlePerm(perms) {
    Alert.alert('Permissions', JSON.stringify(perms));
  }

  getDeliveryZone = () => {
    const {auth} = this.props;
    if (auth?.partner !== null && auth?.activeAddress !== undefined) {
      if (
        auth?.partner?.delivery_zones?.some(
          (zone) => zone?.district === auth?.activeAddress?.district,
        )
      ) {
        this.setState({
          delivery_zone: auth?.partner?.delivery_zones.find(
            (zone) => zone?.district === auth?.activeAddress?.district,
          ),
        });
      } else {
        this.setState({
          delivery_zone: auth?.partner?.delivery_zones.find(
            (zone) => zone?.district === 'Выбрать все районы (Москва)\r\n',
          ),
        });
      }
    }
  };

  getArticles = () => {
    const {navigation} = this.props;
    this.setState({loadingArticles: true});
    GuestServices.getArticles()
      .then((response) => {
        if (response.data.success === 1) {
          this.setState({articles: response.data.data});
        } else {
          console.error(
            'something went wrong while getting articles',
            response.data.message,
          );
          navigation.navigate('ErrorScreen', {
            message: response.data.message,
          });
        }
      })
      .catch((err) => {
        console.error('err while getting articles', err);
        navigation.navigate('ErrorScreen', {message: err.message});
      })
      .finally(() => {
        this.setState({loadingArticles: false});
      });
  };

  getCategories = () => {
    const {auth, actions, navigation} = this.props;

    this.setState({loadingCategories: true});
    GuestServices.getCategories()
      .then((response) => {
        if (response.data.success === 1) {
          this.setState({categories: response.data.data});
          var tmp = [];
          response.data.data.forEach((ele, index) =>
            auth?.categories[index] === undefined
              ? tmp.push(false)
              : tmp.push(auth?.categories[index] * true),
          );
          this.setState({cats: tmp});
          actions.saveCategories(tmp);
        } else {
          console.error(
            'something went wrong while getting categories',
            response.data.message,
          );
          navigation.navigate('ErrorScreen', {
            message: response.data.message,
          });
        }
      })
      .catch((err) => {
        console.error('err while getting categories', err);
        navigation.navigate('ErrorScreen', {message: err.message});
      })
      .finally(() => {
        this.setState({loadingCategories: false});
      });
  };

  functionX = () => {
    const {auth, actions, navigation} = this.props;
    var tmpArray = [];
    auth?.categories.forEach((category, index) => {
      if (auth?.categories[index]) {
        tmpArray.push(index + 1);
      }
    });
    if (auth?.user === null) {
      // guest mode
      if (auth?.activeAddress?.district !== null) {
        this.setState({loadingPartners: true});
        var ids = undefined;
        if (tmpArray.length !== 0) {
          ids = tmpArray;
        }
        GuestServices.getAllPartners(ids, auth?.activeAddress?.district)
          .then((response) => {
            if (response.data.success === 1) {
              let partners = response.data.data.data;
              partners = this.filterBreakTimes(partners);
              actions.saveCatalogues(partners, () => {
                this.setState({loadingPartners: false});
              });
            } else {
              console.error(
                'sth wrong : getAllPartners',
                response.data.message,
              );
            }
          })
          .catch((err) => {
            console.error('err : getAllPartners', err);
          })
          .finally(() => {
            this.setState({loadingPartners: false});
          });
      }
    } else {
      // logged in user
      if (auth?.category !== null) {
        // category not selected
        this.setState({selectedCategoryIndex: auth?.category});
      }
      actions.setLoadingFalse();
      // category selected
      if (tmpArray.length !== 0) {
        this.setState({
          loadingPartners: true,
        });
        this.getPartnersByCategory();
      } else {
        this.setState({loadingPartners: true});
        GuestServices.getCatalogues(auth?.user?.access_token)
          .then((response) => {
            if (response.data.success === 1) {
              let partners = response.data.data.data;
              partners = this.filterBreakTimes(partners);
              actions.saveCatalogues(partners, () => {
                this.setState({loadingPartners: false});
              });
            } else {
              console.error(
                'something went wrong while getting catalogues',
                response.data.message,
              );
              this.setState({loading: false});

              navigation.navigate('ErrorScreen', {
                message: response.data.message,
              });
            }
          })
          .catch((err) => {
            console.error('err in getting partners___', err);
            this.setState({loading: false});

            navigation.navigate('ErrorScreen', {message: err.message});
          })
          .finally(() => {
            this.setState({loadingPartners: false});
          });
      }
    }
  };

  getPartnersByCategory = () => {
    const {auth, actions, navigation} = this.props;
    this.setState({loadingPartners: true});
    var tmpArray = [];
    auth?.categories.forEach((category, index) => {
      if (auth?.categories[index]) {
        tmpArray.push(index + 1);
      }
    });

    GuestServices.getPartnersByCategory(auth?.user?.access_token, tmpArray)
      .then((response) => {
        if (response.data.success === 1) {
          let partners = response.data.data.data;
          partners = this.filterBreakTimes(partners);
          actions.saveCatalogues(partners, () => {
            this.setState({loadingPartners: false});
          });
        } else {
          console.error(
            'something went wrong while getting partners by categories',
            response.data.message,
          );
          navigation.navigate('ErrorScreen', {
            message: response.data.message,
          });
        }
      })
      .catch((err) => {
        console.error('err in getting partners', err);

        navigation.navigate('ErrorScreen', {message: err.message});
      })
      .finally(() => {
        this.setState({loadingPartners: false});
      });
  };

  onFocus = () => {
    const {auth} = this.props;
    if (auth?.user === null) {
    } else {
      this.getCart();
    }
    this.setState({showAlert: false});
    this.getDeliveryZone();
    this.getArticles();
    this.getCategories();

    this.functionX();
  };

  onArticleBtn = (article) => {
    this.props.navigation.navigate('Article', {article: article});
  };

  onPartnerBtn = (index) => {
    const {auth, actions, navigation} = this.props;
    const {cart} = this.state;
    const _cart = cart !== null ? cart?.products : auth?.cart;
    if (
      auth?.partner?.id !== auth?.catalogues[index]?.id &&
      _cart !== null &&
      _cart.length !== 0
    ) {
      this.setState({selectedIndex: index});
      Alert.alert(
        'Хотите сделать заказ у другого партнера? Сначала очистите корзину',
        'Вы собираетесь очистить свою корзину.',
        [
          {
            text: 'Нет',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Да',
            onPress: () => {
              this._clearCart();
            },
          },
        ],
      );
    } else {
      actions.setPartner(auth?.catalogues[index]);
      navigation.navigate('ProductDetail', {from: 'Catalogue'});
    }
  };

  filterBreakTimes = (partners) => {
    let flag = false;
    partners = partners.filter((partner) => {
      flag = false;
      if (partner.break_times.length > 0) {
        partner.break_times.map((timeframe) => {
          if (this.checkIsBetween(timeframe)) {
            flag = true;
          }
        });
      }
      return flag === false;
    });
    return partners;
  };

  onCategoryBtn = (index) => {
    const {auth, actions, navigation} = this.props;

    const {cats} = this.state;
    var tmpCats = cats;
    // if selected, unselect; if unselected, select
    tmpCats[index] = !tmpCats[index];
    this.setState({cats: tmpCats});
    actions.saveCategories(tmpCats);
    var tmpArray = [];
    tmpCats.forEach((category, index) => {
      if (tmpCats[index]) {
        tmpArray.push(index + 1);
      }
    });
    // not categories selected, get all partners again.
    if (auth?.user !== null) {
      if (tmpArray.length !== 0) {
        this.getPartnersByCategory();
      } else {
        this.functionX();
      }
    } else {
      const _district =
        auth?.activeAddress?.district !== null
          ? auth?.activeAddress?.district
          : 'Выбрать все районы (Москва)\r\n';
      this.setState({loadingPartners: true});
      var ids = undefined;
      if (tmpArray.length !== 0) {
        ids = tmpArray;
      }
      GuestServices.getAllPartners(ids, _district)
        .then((response) => {
          if (response.data.success === 1) {
            let partners = response.data.data.data;
            partners = this.filterBreakTimes(partners);
            actions.saveCatalogues(partners, () => {
              this.setState({loadingPartners: false});
            });
          } else {
            console.error('sth wrong : getAllPartners', response.data.message);
            navigation.navigate('ErrorScreen', {
              message: response.data.message,
            });
          }
        })
        .catch((err) => {
          console.error('err : getAllPartners', err.message);
          navigation.navigate('ErrorScreen', {message: err.message});
        })
        .finally(() => {
          this.setState({loadingPartners: false});
        });
    }
  };

  getEconomizedPrice() {
    const {auth} = this.props;
    const {cart} = this.state;
    var ecoPrice = 0;
    if (cart !== null) {
      cart?.products.forEach((item) => {
        var itemInfo = auth?.products.find(
          (product) => product?.id === item?.productID,
        );
        if (itemInfo && itemInfo?.hasPromo === 1) {
          ecoPrice +=
            (itemInfo?.price - itemInfo?.promo?.new_price) * item?.quantity;
        }
      });
    }

    return parseFloat(ecoPrice.toFixed(2));
  }

  renderArticlesView = ({item, index}) => {
    if (item.image) {
      var extension = item.image.split('.').pop();
      if (extension === 'svg') {
        return (
          <TouchableOpacity
            onPress={() => {
              this.onArticleBtn(item);
            }}
            style={styles.article}>
            <ImageBackground
              source={Images.productPlaceholder}
              imageStyle={{borderRadius: 10}}
              style={styles.articleImgBackground}>
              <SvgCssUri
                width="90"
                height="90"
                uri={
                  'https://local-admin.its-dev.ru/media/articleImages/' +
                  item.image
                }
              />
            </ImageBackground>
          </TouchableOpacity>
        );
      } else if (extension === 'png' || extension === 'jpg') {
        return (
          <TouchableOpacity
            onPress={() => {
              this.onArticleBtn(item);
            }}
            style={styles.article}>
            <ImageBackground
              source={Images.productPlaceholder}
              imageStyle={{borderRadius: 10}}
              style={styles.articleImgBackground}>
              <Image
                source={{
                  uri:
                    'https://local-admin.its-dev.ru/media/articleImages/' +
                    item.image,
                }}
                style={styles.articleImg}
                resizeMode="cover"
              />
            </ImageBackground>
          </TouchableOpacity>
        );
      }
    } else {
      return (
        <TouchableOpacity
          onPress={() => {
            this.onArticleBtn(item);
          }}
          style={styles.article}>
          <ImageBackground
            source={Images.productPlaceholder}
            imageStyle={{borderRadius: 10}}
            style={styles.articleImgBackground}></ImageBackground>
        </TouchableOpacity>
      );
    }
  };

  renderTypesView(item, index) {
    const {auth} = this.props;

    if (item.icon !== null) {
      var extension = item.icon.split('.').pop();
      if (extension === 'svg') {
        return (
          <TouchableOpacity
            onPress={() => {
              this.onCategoryBtn(index);
            }}
            style={[
              styles.type,
              {
                backgroundColor: auth.categories[index]
                  ? BaseColor.textPrimaryColor
                  : BaseColor.textInputBackgroundColor,
              },
            ]}>
            <View style={styles.typeView}>
              <SvgCssUri
                width="20"
                height="20"
                // source={{
                //   uri:
                //     'http://local-admin.its-dev.ru/media/categoryIcons/' +
                //     item.icon,
                // }}
                uri={
                  'https://local-admin.its-dev.ru/media/categoryIcons/' +
                  item.icon
                }
              />
            </View>
            <Text
              body2
              style={{
                color: auth.categories[index]
                  ? 'white'
                  : BaseColor.textPrimaryColor,
              }}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      } else if (extension === 'jpg' || extension === 'png') {
        return (
          <TouchableOpacity
            onPress={() => {
              this.onCategoryBtn(index);
            }}
            style={[
              styles.type,
              {
                backgroundColor: auth.categories[index]
                  ? BaseColor.textPrimaryColor
                  : BaseColor.textInputBackgroundColor,
              },
            ]}>
            <View style={styles.typeView}>
              <Image
                source={{
                  uri:
                    'https://local-admin.its-dev.ru/media/categoryIcons/' +
                    item.icon,
                }}
                style={styles.typeImg}
                resizeMode="contain"
              />
            </View>
            <Text
              body2
              style={{
                color: auth.categories[index]
                  ? 'white'
                  : BaseColor.textPrimaryColor,
              }}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      }
    }
  }

  _clearCart = async () => {
    this.setState({showAlert: false});
    const {auth, actions, navigation} = this.props;
    const {selectedIndex, cart} = this.state;
    if (auth.user === null) {
      actions.clearCart();
      actions.clearTotalPrice();
      actions.setPartner(auth.catalogues[selectedIndex]);
      navigation.navigate('ProductDetail', {from: 'Catalogue'});
    } else {
      // clear cart
      this.setState({loadingPartners: true});
      UserServices.clearCart(auth.user.access_token, cart.id)
        .then((response) => {
          if (response.data.success === 1) {
            actions.clearTotalPrice();
            actions.clearDiscountPrice();
            actions.clearPartner();
            actions.setPartner(auth.catalogues[selectedIndex]);
            navigation.navigate('ProductDetail', {from: 'Catalogue'});
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
          console.error('err in clearing cart', err);
          navigation.navigate('ErrorScreen', {message: err.message});
        })
        .finally(() => {
          this.setState({loadingPartners: false});
        });
    }
  };

  checkMinimalCheckout = () => {
    const {auth} = this.props;
    if (
      auth.partner !== null &&
      auth.activeAddress !== null &&
      (auth.partner.delivery_zones !== undefined ||
        auth.partner.delivery_zones !== null)
    ) {
      if (
        auth.partner.delivery_zones.some(
          (zone) => zone.district === auth.activeAddress.district,
        ) ||
        auth.partner.delivery_zones.some(
          (zone) => zone.district === 'Выбрать все районы (Москва)\r\n',
        )
      ) {
        return (
          auth.totalPrice <
          auth.partner.delivery_zones.find(
            (zone) => zone.district === auth.activeAddress.district,
          )?.min_order_price
        );
      } else {
        return (
          auth.totalPrice <
          auth.partner.delivery_zones.find(
            (zone) => zone.district === 'Выбрать все районы (Москва)\r\n',
          )?.min_order_price
        );
      }
    } else {
      return true;
    }
  };

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

  renderPartnersView(item, index) {
    const {auth} = this.props;
    // if no activeAddress, which means in the guest mode
    if (auth.activeAddress === null || auth.activeAddress === undefined) {
      return (
        <PartnerItem
          item={item}
          onPress={() => {
            this.onPartnerBtn(index);
          }}
        />
      );
    } else {
      // if all of Moscow
      if (
        item.delivery_zones.some(
          (zone) => zone.district === 'Выбрать все районы (Москва)\r\n',
        )
      ) {
        let deliveryZone = item.delivery_zones.find(
          (zone) => zone.district === 'Выбрать все районы (Москва)\r\n',
        );
        // show partners

        return (
          <PartnerItem
            deliveryZone={deliveryZone}
            item={item}
            onPress={() => {
              this.onPartnerBtn(index);
            }}
          />
        );
      }

      // else, find deliveryZone and pick partners which has that delivery zone
      let deliveryZone = item.delivery_zones.find(
        (zone) => zone.district === auth.activeAddress.district,
      );

      if (deliveryZone !== undefined) {
        return (
          <PartnerItem
            deliveryZone={deliveryZone}
            item={item}
            onPress={() => {
              this.onPartnerBtn(index);
            }}
          />
        );
      } else {
        return (
          <PartnerItem
            // deliveryZone={deliveryZone}
            item={item}
            onPress={() => {
              this.onPartnerBtn(index);
            }}
          />
        );
      }
    }
  }

  render() {
    const {
      articles,
      svgSize,
      loadingArticles,
      loadingPartners,
      loadingCategories,
      categories,
      locationPermissionStatus,
      delivery_zone,
      selectedCategoryIndex,
    } = this.state;
    var ecoPrice = 0;
    const {auth} = this.props;
    return (
      <AndroidBackHandler
        onBackPress={() => {
          return true;
        }}>
        <FocusEfect onFocus={this.onFocus} />
        <SafeAreaView style={styles.contain} forceInset={{top: 'never'}}>
          <Header
            style={{backgroundColor: BaseColor.backgroundColor}}
            title={
              auth.activeAddress ? auth.activeAddress.address : 'Ваш адрес'
            }
            titleClickable={true}
            renderLeft={() => {
              return (
                <Feather
                  name="menu"
                  size={BaseSize.headerMenuIconSize}
                  color={BaseColor.redColor}
                />
              );
            }}
            onPressLeft={() => {
              this.props.navigation.openDrawer();
            }}
            onPressCenter={() => {
              this.props.navigation.navigate('Address1');
            }}
          />
          {locationPermissionStatus ? (
            <Text>{'Необходимо разрешить приложению доступ к геолокации'}</Text>
          ) : (
            <>
              <ScrollView style={styles.partnerView}>
                {/* articles/news */}
                <View>
                  {loadingArticles ? (
                    <Placeholder
                      Animation={Fade}
                      Left={(props) => (
                        <PlaceholderMedia
                          isRound={true}
                          style={[styles.articleImgPlaceholder, props.style]}
                        />
                      )}>
                      <View style={{marginTop: 15}}>
                        <PlaceholderLine width={80} />
                        <PlaceholderLine />
                        <PlaceholderLine width={30} />
                      </View>
                    </Placeholder>
                  ) : (
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={articles}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={this.renderArticlesView}
                    />
                  )}
                </View>
                {/* partners */}
                {loadingPartners ? (
                  <View style={{alignItems: 'center', marginTop: 15}}>
                    <Placeholder Animation={Fade}>
                      <PlaceholderMedia
                        isRound={true}
                        style={styles.partnerImg}
                      />
                      <PlaceholderLine
                        width={80}
                        height={20}
                        style={{marginTop: 10, marginBottom: 32}}
                      />
                    </Placeholder>
                    <Placeholder Animation={Fade}>
                      <PlaceholderMedia
                        isRound={true}
                        style={styles.partnerImg}
                      />
                      <PlaceholderLine
                        width={40}
                        height={20}
                        style={{marginTop: 10, marginBottom: 32}}
                      />
                    </Placeholder>
                    <Placeholder Animation={Fade}>
                      <PlaceholderMedia
                        isRound={true}
                        style={styles.partnerImg}
                      />
                      <PlaceholderLine
                        width={55}
                        height={20}
                        style={{marginTop: 10, marginBottom: 32}}
                      />
                    </Placeholder>
                  </View>
                ) : auth.catalogues.length === 0 ? (
                  // no partners found
                  <ScrollView contentContainerStyle={{alignItems: 'center'}}>
                    <View style={{marginVertical: 20}}>
                      <NoPartners width={svgSize} height={svgSize} />
                    </View>
                    <View style={{alignItems: 'center'}}>
                      <Text
                        title1
                        style={{
                          textAlign: 'center',
                          marginHorizontal: 20,
                          lineHeight: 34,
                        }}>
                        {'Мы уже занимаемся решением этого вопроса'}
                      </Text>
                      <Text
                        middleBody
                        grayColor
                        style={{
                          marginTop: 20,
                          textAlign: 'center',
                          marginHorizontal: 20,
                          lineHeight: 24,
                        }}>
                        {`В данной категории партнеры
еще недоступны, но в скором времени они появятся`}
                      </Text>
                    </View>
                  </ScrollView>
                ) : (
                  // partners
                  <FlatList
                    style={{marginTop: 20}}
                    showsVerticalScrollIndicator={false}
                    data={auth.catalogues}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item, index}) =>
                      this.renderPartnersView(item, index)
                    }
                  />
                )}
              </ScrollView>
              {/* categories */}
              <View style={styles.bottomBar}>
                <View style={{paddingLeft: 20, paddingVertical: 15}}>
                  {loadingCategories ? (
                    <Placeholder style={{zIndex: 2}} Animation={Fade}>
                      <View style={{flexDirection: 'row'}}>
                        <PlaceholderMedia
                          isRound={true}
                          style={styles.typesViewPlaceholder}
                        />
                        <PlaceholderMedia
                          isRound={true}
                          style={styles.typesViewPlaceholder}
                        />
                        <PlaceholderMedia
                          isRound={true}
                          style={styles.typesViewPlaceholder}
                        />
                        <PlaceholderMedia
                          isRound={true}
                          style={styles.typesViewPlaceholder}
                        />
                        <PlaceholderMedia
                          isRound={true}
                          style={styles.typesViewPlaceholder}
                        />
                      </View>
                    </Placeholder>
                  ) : selectedCategoryIndex === 100000 ? (
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={categories}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item, index}) =>
                        this.renderTypesView(item, index)
                      }
                    />
                  ) : (
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={categories}
                      initialScrollIndex={selectedCategoryIndex}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item, index}) =>
                        this.renderTypesView(item, index)
                      }
                    />
                  )}
                </View>
                {/* minimal order price warning */}
                {loadingCategories ||
                  (auth?.totalPrice > 0 && this.checkMinimalCheckout() && (
                    <View style={{backgroundColor: '#262626'}}>
                      <Text
                        body2
                        whiteColor
                        style={{textAlign: 'center', paddingVertical: 3}}>
                        {delivery_zone !== undefined &&
                          'Минимальная сумма заказа ' +
                            delivery_zone?.min_order_price +
                            ' руб.'}
                      </Text>
                    </View>
                  ))}
                {/* cart */}
                {loadingCategories ||
                  (auth?.totalPrice > 0 && (
                    <View style={styles.cart}>
                      <View style={styles.totalPrice}>
                        {ecoPrice > 0 ? (
                          <>
                            <View style={{alignItems: 'flex-start'}}>
                              <Text
                                style={{
                                  textDecorationLine: 'line-through',
                                  textDecorationStyle: 'solid',
                                  color: '#B3B3B3',
                                }}>
                                {ecoPrice} ₽
                              </Text>
                            </View>
                            <Text title2>
                              {auth?.totalPrice +
                                (delivery_zone.free_delivery_from >
                                  auth.totalPrice &&
                                  delivery_zone?.delivery_price)}{' '}
                              ₽
                            </Text>
                          </>
                        ) : (
                          <View style={{alignItems: 'flex-start'}}>
                            <Text title2 semiBold>
                              {auth?.totalPrice +
                                (delivery_zone.free_delivery_from >
                                  auth.totalPrice &&
                                  delivery_zone?.delivery_price)}{' '}
                              ₽
                            </Text>
                            <Text>{'Сегодня'}</Text>
                          </View>
                        )}
                      </View>
                      <View style={{flex: 1}}>
                        <TouchableOpacity
                          disabled={this.checkMinimalCheckout()}
                          onPress={() => {
                            this.props.navigation.navigate('Cart');
                          }}
                          style={{
                            borderRadius: 5,
                            // height: 44,
                            paddingVertical: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: !this.checkMinimalCheckout()
                              ? BaseColor.redColor
                              : '#F1F1F1',
                            marginRight: 20,
                          }}>
                          <Text
                            middleBody
                            semiBold
                            style={{
                              color: !this.checkMinimalCheckout()
                                ? 'white'
                                : '#B3B3B3',
                            }}>
                            {'В корзину'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
              </View>
            </>
          )}
        </SafeAreaView>
      </AndroidBackHandler>
    );
  }
}

const mapStateToProps = (state) => {
  return {auth: state.auth, catalogues: state.catalogues};
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(AuthActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Catalogue);
