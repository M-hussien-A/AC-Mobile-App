import { useWindowDimensions } from 'react-native';

const MAX_APP_WIDTH = 480;

export function useResponsiveDimensions() {
  const { width, height } = useWindowDimensions();
  const appWidth = Math.min(width, MAX_APP_WIDTH);
  return { width: appWidth, height, rawWidth: width };
}
