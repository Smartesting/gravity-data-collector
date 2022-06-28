export function mockWindowScreen() {
    Object.defineProperty(window, "screen", {
        value: {
            width: 1020,
            height: 850,
            availWidth: 1440,
            availHeight: 900,
            colorDepth: 1,
            pixelDepth: 1,
            orientation: { type: "landscape" }
        },
        writable: true
    });
}

export function mockWindowLocation() {
    Object.defineProperty(window, "location", {
        value: {
            href: "https://www.foo.com/bar",
            pathname: "/bar",
            search: ""
        },
        writable: true
    });
}

type PointerEvent = {}

export function mockClick(target: HTMLElement) {
    const event: PointerEvent = {
        target,
        clientX: 10,
        clientY: 10
    };
    return event;
}

export default { mockWindowScreen, mockWindowLocation, mockClick };
