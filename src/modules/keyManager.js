import { SessionManager } from './sessionManager.js';

class KeyManager {

    #cache = {};

    /**
     * Create a keystore to retrieve and store keys for encrypted images.
     *
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     */
    constructor(sessionManager) {
        this.sessionManager = sessionManager;
    }

    /**
     * Retrieve a key.
     *
     * @param {string} imageId The image id for the image key
     * @returns The key or rejected promise
     */
    get = (imageId) => {
        if (this.#cache[imageId]) {
            // Return key from cache
            return Promise.resolve(this.#cache[imageId]);
        }
        return this.sessionManager.keystore('/session/whoami')
            .then(SessionManager.json)
            .then((whoami) => this.sessionManager.keystore(`/entries/${imageId}/${whoami.uid}`, {
                method: 'GET'
            }))
            .then((response) => {
                if (response.status !== 200 || response.headers.get('Content-Type') !== 'text/plain') {
                    // Key not found or other error, reject
                    return Promise.reject();
                }
                return response.text();
            })
            .then((key) => {
                // Store the key in the cache for any future requests
                this.#cache[imageId] = key;
                return key;
            });
    };

    /**
     * Get the data request headers for a specific image key.
     * When the key is not set, an empty headers object will be returned.
     *
     * @param {string} imageId The image id for the image key
     * @returns A headers object, with 'Hansken-Image-Key' set when the key was stored for the current user
     */
    getKeyHeaders = (imageId) => this.get(imageId).then((key) => {
        return {
            'Hansken-Image-Key': key
        };
    }, () => {
        // Key was not available, return an empty headers object
        return {};
    });
}

export { KeyManager };
