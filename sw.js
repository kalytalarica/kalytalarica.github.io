importScripts('js/cache-polyfill.js');

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/',
        'index.html',
        'assets/kalyta.png',
        'assets/dedo.png',
        'assets/flap.wav',
        'assets/grama.png',
        'assets/hurt.wav',
        'assets/icon-120.png',
        'assets/icon.png',
        'assets/nuvems.png',
        'assets/score.wav',
        'js/main.js',
        'js/jquery.min.js',
        'js/phaser.min.js',
        'favicon.ico',
        'manifest.json',
        'img/icon-72x72.png',
        'img/icon-96x96.png',
        'img/icon-128x128.png',
        'img/icon-144x144.png',
        'img/icon-152x152.png',
        'img/icon-192x192.png',
        'img/icon-384x384.png',
        'img/icon-512x512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});