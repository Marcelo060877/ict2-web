const CACHE_NAME = 'ict-interactive-v2'; // Se incrementa la versión de la caché
const urlsToCache = [
    '/ict2-web/', // La URL raíz de su PWA en GitHub Pages
    '/ict2-web/index.html',
    '/ict2-web/manifest.json',
    '/ict2-web/service-worker.js',
    '/ict2-web/icon-192x192.png',
    '/ict2-web/icon-512x512.png',
    'https://cdn.tailwindcss.com'
];

// Evento 'install': se dispara cuando el Service Worker se instala por primera vez
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache abierto');
                return cache.addAll(urlsToCache); // Añade todos los recursos a la caché
            })
            .catch(error => {
                console.error('Service Worker: Fallo al añadir recursos a la caché durante la instalación:', error);
            })
    );
});

// Evento 'activate': se dispara cuando el Service Worker se activa
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName); // Elimina cachés antiguas
                    }
                })
            );
        })
    );
});

// Evento 'fetch': se dispara cada vez que el navegador solicita un recurso
self.addEventListener('fetch', event => {
    // Solo manejar peticiones GET y evitar peticiones de extensiones de Chrome DevTools u otras
    if (event.request.method === 'GET' && !event.request.url.includes('extensions::') && !event.request.url.includes('browser-sync')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // Si el recurso está en la caché, lo devuelve
                    if (response) {
                        return response;
                    }
                    // Si no, lo busca en la red
                    return fetch(event.request).then(
                        response => {
                            // Comprueba si hemos recibido una respuesta válida
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }
                            // Clona la respuesta porque la corriente de la respuesta solo puede ser consumida una vez
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache); // Almacena la nueva respuesta en la caché
                                });
                            return response;
                        }
                    ).catch(error => {
                        console.error('Service Worker: Fallo en la petición fetch:', error);
                        // Opcional: Podríamos servir una página offline aquí si la petición falla
                        // return caches.match('/ict2-web/offline.html'); // Si tuviera una página offline.
                    });
                })
        );
    }
});

