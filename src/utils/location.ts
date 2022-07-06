import { GravityLocation } from "../types";

function location(): GravityLocation {
    if (!window) {
        return {
            href: "",
            pathname: "",
            search: ""
        };
    }

    const { href, pathname} = window.location
    const search = window.location.search.slice(1)

    return {
        href,
        pathname,
        search
    };
}

export default location;
