"use strict";
self.addEventListener('fetch', function (event) {
    //@ts-ignore
    event.respondWith(fetch(event.request));
});
