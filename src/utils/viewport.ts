import { ViewportData } from '../types'

export default function viewport(windowInstance: Window): ViewportData {
  const {
    innerWidth: viewportWidth,
    innerHeight: viewportHeight,
    outerWidth: windowWidth,
    outerHeight: windowHeight,
  } = windowInstance

  const {
    colorDepth,
    pixelDepth,
    orientation,
    width: screenWidth,
    height: screenHeight,
    availWidth: availScreenWidth,
    availHeight: availScreenHeight,
  } = windowInstance.screen

  return {
    viewportWidth,
    viewportHeight,
    windowWidth,
    windowHeight,
    screenWidth,
    screenHeight,
    availScreenWidth,
    availScreenHeight,
    colorDepth,
    pixelDepth,
    orientation: orientation?.type,
  }
}
