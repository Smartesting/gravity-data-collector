import { GravityLocation } from "../types";

function location(): GravityLocation {
    if (!window) {
        return {
            href: "",
            pathname: "",
            search: ""
        };
    }

    return {
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search.slice(1)
    };
}

export default location;