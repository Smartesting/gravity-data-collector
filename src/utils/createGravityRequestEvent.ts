import EventType from "./eventType";
import getLocationData from "./getLocationData";

function createGravityRequestEvent(): GravityRequestEvent {
    return {
        type: EventType.Resource,
        requestData: {
            type: EventType.Request,
            url: "",
            method: "",
            body: "",
            recordedAt: Date.now(),
            location: getLocationData()
        },
        responseData: {
            type: EventType.Response,
            status: 0,
            body: "",
            location: {
                href: "",
                pathname: "",
                search: ""
            },
            recordedAt: undefined
        }
    };
}

export default createGravityRequestEvent;
