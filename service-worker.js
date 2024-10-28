const CACHE_NAME = 'quiz-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/courses.html',
  '/quiz.html',
  '/course-detail.html',
  '/style.css',
  '/functions.js',
  '/header.html',
  '/header-loader.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
