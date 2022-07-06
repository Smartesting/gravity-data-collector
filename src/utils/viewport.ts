import { ViewportData } from "../types";

export default function viewport(): ViewportData {

    if (!window) {
        return {};
    }

    const {
        innerWidth: viewportWidth,
        innerHeight: viewportHeight,
        outerWidth: windowWidth,
        outerHeight: windowHeight
    } = window;

    const {
        colorDepth,
        pixelDepth,
        orientation,
        width: screenWidth,
        height: screenHeight,
        availWidth: availScreenWidth,
        availHeight: availScreenHeight
    } = window.screen;

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
        orientation: orientation ? orientation.type : undefined
    };
}
