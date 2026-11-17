'use strict';
const CACHE_NAME = 'studentlife-timetable-v1';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.searchParams.has('logout')) {
    event.respondWith((async () => {
      await caches.delete(CACHE_NAME);
      return fetch(request);
    })());
    return;
  }

  if (url.searchParams.get('page') !== 'timetable') return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cacheUrl = new URL(url.pathname, url.origin);
    cacheUrl.searchParams.set('page', 'timetable');
    const language = url.searchParams.get('lang');
    if (language) cacheUrl.searchParams.set('lang', language);
    const cacheKey = new Request(cacheUrl.toString(), { method: 'GET' });

    try {
      const response = await fetch(request);
      if (response.ok && (response.headers.get('content-type') || '').includes('text/html')) {
        try {
          await cache.put(cacheKey, response.clone());
        } catch (_) {}
      }
      return response;
    } catch (_) {
      const saved = await cache.match(cacheKey);
      if (saved) return saved;
      return new Response(
        '<!doctype html><html><meta charset="utf-8"><title>Timetable unavailable</title><body><h1>Offline timetable not saved yet</h1><p>Open your timetable while connected to save a copy on this device.</p></body></html>',
        { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }
  })());
});
