import { StyleSheet } from 'react-native';
import { BaseColor } from '@config';

export default StyleSheet.create({
  contain: {
    flex: 1,
  },
  mainContainer: {
    paddingTop: 10,
    marginHorizontal: 20,
  },
  textInput: {
    color: BaseColor.textPrimaryColor,
    backgroundColor: BaseColor.textInputBackgroundColor,
    paddingLeft: 15,
    paddingTop: 12,
    paddingBottom: 14,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 10,
    fontSize: 16,
    height: 44,
  },
  saveBtn: {
    marginBottom: 30,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  bottomContainer: {
    justifyContent: 'flex-end',
    marginHorizontal: 20,
  },
});
