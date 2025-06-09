const CACHE_NAME = 'ict-interactive-v1';
const urlsToCache = [
    '/',
    '/telecomunicaciones_ict', // La ruta de tu página principal
    '/manifest.json',
    'https://cdn.tailwindcss.com'
    // Puedes añadir más recursos estáticos aquí si los tienes, como CSS personalizados o imágenes
];

// Evento 'install': se dispara cuando el Service Worker se instala por primera vez
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache); // Añade todos los recursos a la caché
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
                        console.log('Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName); // Elimina cachés antiguas
                    }
                })
            );
        })
    );
});

// Evento 'fetch': se dispara cada vez que el navegador solicita un recurso
self.addEventListener('fetch', event => {
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
                );
            })
    );
});
