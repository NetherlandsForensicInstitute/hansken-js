import { SessionManager } from './sessionManager.js';

class SessionContext {
    #whoami;

    /**
     * Create a context for the session of a hansken service.
     *
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     * @param {string} The url of the hansken service
     */
    constructor(sessionManager, serviceUrl) {
        this.sessionManager = sessionManager;
        this.serviceUrl = serviceUrl;
    }

    whoami = () => {
        if (this.#whoami) {
            return Promise.resolve(this.#whoami);
        }
        return this.sessionManager.fetch(this.serviceUrl, '/session/whoami')
        .then(SessionManager.json)
        .then((whoami) => {
            this.#whoami = whoami;
            return whoami;
        });
    };
}

export { SessionContext };
