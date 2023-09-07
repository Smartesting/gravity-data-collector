"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
function interceptNetworkRequests(ee) {
    var open = XMLHttpRequest.prototype.open;
    var send = XMLHttpRequest.prototype.send;
    var isRegularXHR = open.toString().indexOf('native code') !== -1;
    // don't hijack if already hijacked - this will mess up with frameworks like Angular with zones
    // we work if we load first there which we can.
    if (isRegularXHR) {
        XMLHttpRequest.prototype.open = function () {
            ee.onOpen && ee.onOpen(this, arguments);
            if (ee.onLoad) {
                this.addEventListener('load', ee.onLoad.bind(ee));
            }
            if (ee.onError) {
                this.addEventListener('error', ee.onError.bind(ee));
            }
            return open.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function () {
            ee.onSend && ee.onSend(this, arguments);
            return send.apply(this, arguments);
        };
    }
    var fetch = window.fetch || '';
    // don't hijack twice, if fetch is built with XHR no need to decorate, if already hijacked
    // then this is dangerous and we opt out
    var isFetchNative = fetch.toString().indexOf('native code') !== -1;
    if (isFetchNative) {
        window.fetch = function () {
            ee.onFetch && ee.onFetch(arguments);
            var p = fetch.apply(this, arguments);
            p.then(ee.onFetchResponse, ee.onFetchError);
            return p;
        };
        // at the moment, we don't listen to streams which are likely video
        var json_1 = Response.prototype.json;
        var text_1 = Response.prototype.text;
        var blob_1 = Response.prototype.blob;
        Response.prototype.json = function () {
            var p = json_1.apply(this.arguments);
            p.then(ee.onFetchLoad && ee.onFetchLoad.bind(ee, 'json'));
            return p;
        };
        Response.prototype.text = function () {
            var p = text_1.apply(this.arguments);
            p.then(ee.onFetchLoad && ee.onFetchLoad.bind(ee, 'text'));
            return p;
        };
        Response.prototype.blob = function () {
            var p = blob_1.apply(this.arguments);
            p.then(ee.onFetchLoad && ee.onFetchLoad.bind(ee, 'blob'));
            return p;
        };
    }
    return ee;
}
exports.default = interceptNetworkRequests;
