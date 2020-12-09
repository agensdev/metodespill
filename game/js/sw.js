var cacheName = 'metodeSpillPWA';
var filesToCache = [
    '../index.html',
    '../css/base.css',
    '../js/app.mjs',
    '../js/game.mjs',
    '../js/l8n.mjs',
    '../games/default.json'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        }).catch(err => {
            console.log(err)
        })
    );
});


self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request);
        }).catch( err => {
            console.log(err)
        })
    );
});