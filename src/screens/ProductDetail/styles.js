import { StyleSheet, Dimensions, Platform } from 'react-native';
import { BaseColor } from '@config';
import * as Utils from '@utils';

export default StyleSheet.create({
  contain: { flex: 1, backgroundColor: BaseColor.grayBackgroundColor },
  mainContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  bottomContainer: {
    flex: 2,
    justifyContent: 'flex-end',
    marginHorizontal: 20,
  },
  bottomBar: {
    zIndex: 2,
    height: 64,
    paddingVertical: 5,
    backgroundColor: BaseColor.whiteColor,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  totalPrice: {
    flex: 1,
    // alignItems: 'center',
    // padding: 5,
    marginLeft: 10,
  },
  text: { textAlign: 'center', paddingBottom: 20 },
  addBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BaseColor.redColor,
    borderRadius: 5,
    marginHorizontal: 45,
  },
  btnCaption: {
    color: BaseColor.whiteColor,
    padding: 7,
  },
  nextBtn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 5,
    paddingVertical: 5,
  },
  imgBanner: {
    width: '100%',
    // height: 300,
    // position: 'absolute',
    // top: Platform.OS === 'ios' ? 55 : 55,
  },
  contentBoxTop: {
    backgroundColor: BaseColor.grayBackgroundColor,
  },
  typesView: {
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    paddingVertical: 8,
    paddingHorizontal: 11,
    backgroundColor: BaseColor.whiteColor,
  },
  productsView: {
    // flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    // height: Dimensions.get('window').width / 2,
    width: Dimensions.get('window').width / 2 - 25,
    padding: 8,
    justifyContent: 'space-between',
  },
  productImg: {
    width: '100%',
    height: ((Dimensions.get('window').width / 2 - 25) * 4) / 7,
    borderRadius: 5,
    zIndex: 1,
  },
  productImageBtn: { flex: 3, alignItems: 'center', marginBottom: 10 },
  productPrice: {
    width: '100%',
    flexDirection: 'row',
  },
  productSalePrice: {
    // flex: 1,
    backgroundColor: BaseColor.redColor,
    borderRadius: 5,
    padding: 10,
  },
  productOnlySalePrice: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  productOnlySalePriceBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: BaseColor.redColor,
    borderRadius: 5,
    padding: 10,
    // width: '100%',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    color: '#B3B3B3',
    padding: 12,
  },
  typesFlatList: {
    marginLeft: 20,
    marginTop: 10,
  },
  productsFlatList: {
    marginVertical: 20,
  },
  blackBadge: {
    backgroundColor: BaseColor.textPrimaryColor,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 6,
    alignItems: 'center',
  },
  countBtn: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BaseColor.grayBackgroundColor,
    borderRadius: 5,
    width: '100%',
  },
  countBtnInside: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingVertical: 11,
  },
  minimalWarning: {
    zIndex: 2,
    backgroundColor: BaseColor.textPrimaryColor,
    padding: 5,
    height: 30,
    width: '100%',
  },
});
