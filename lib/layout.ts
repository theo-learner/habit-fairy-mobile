import { Dimensions, Platform } from 'react-native';

export const MAX_APP_WIDTH = 480;

export function getAppWidth(): number {
  if (Platform.OS === 'web') {
    return MAX_APP_WIDTH;
  }
  return Dimensions.get('window').width;
}
