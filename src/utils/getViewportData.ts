function getViewportData(): ViewportData {
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
        avaiScreenHeight: window.screen.availHeight,
        colorDepth,
        pixelDepth,
        orientation: window.screen.orientation.type
    };
}

export default getViewportData;
