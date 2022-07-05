import { ViewportData } from "../types";

function viewport(window: Window = global.window): ViewportData {
    if (!window) {
        return {};
    }

    const { colorDepth, pixelDepth } = window.screen;
    return {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        windowWidth: window.outerWidth,
        windowHeight: window.outerHeight,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        availScreenWidth: window.screen.availWidth,
        availScreenHeight: window.screen.availHeight,
        colorDepth,
        pixelDepth,
        orientation: window.screen.orientation ? window.screen.orientation.type : "landscape-primary"
    };
}

export default viewport;
