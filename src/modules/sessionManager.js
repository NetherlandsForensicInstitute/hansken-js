class SessionManager {

    /**
     * Creates an object that handles the authentication of SAML services.
     *
     * @param {String} gatekeeperUrl The url to the Hansken gatekeeper, without trailing '/'
     */
    constructor(gatekeeperUrl) {
        this.gatekeeperUrl = gatekeeperUrl;
    }

    static #login(base, entityID) {
        window.location.href = `${base}/saml/login?idp=${encodeURIComponent(entityID)}&redirectUrl=${encodeURIComponent(window.location.href)}`;
        return Promise.reject(new Error('Redirecting to login page')); // We won't get here
    }

    static #fetch(base, path, req) {
        // Defaults for Cross Origin Resource Sharing
        const request = req || {};
        request.credentials = 'include';
        request.mode = 'cors';

        // TODO accept Request as argument
        return window.fetch(`${base}${path}`, request)
            .then((response) => {
                const contentType = response.headers.get('Content-Type');
                if (response.status === 401 || (response.status === 200 && contentType.indexOf('text/html') === 0)) {
                    return response.text()
                        .then((text) => {
                            if (text.indexOf('SAMLRequest') !== -1) {
                                // This is an html form page redirecting you to the default Identity Provider.
                                // Let's orchestrate that request ourself
                                
                                return window.fetch(`${base}/saml/idps`, {credentials: 'include', mode: 'cors'})
                                    .then((idps) => idps.json())
                                    .then((idps) => {
                                        if (idps.length === 1) {
                                            // Only one Identity Provider available, redirect to login page with redirectUrl
                                            return SessionManager.#login(base, idps[0].entityID);
                                        }

                                        // Ask the user which Identity Provider should be used
                                        const descriptions = idps.map(idp => idp.description || idp.entityID).map(idp => `"${idp}"`).join(', ');
                                        for (let i = 0; i < idps.length; i += 1) {
                                            const idp = idps[i];
                                            // Disable these eslint rules to make sure we can use confirm().
                                            // This is an old browser component, but it is very useful for this case as it is UI Framework independent
                                            // and blocking the thread.
                                            // eslint-disable-next-line no-alert, no-restricted-globals
                                            if (confirm(`Multiple Identity Providers found: ${descriptions}. Do you want to login with Identity Provider "${(idp.description ? idp.description : idp.entityID)}"?`)) {
                                                return SessionManager.#login(base, idp.entityID);
                                            }
                                        }
                                        return Promise.reject(new Error('No Identity Provider chosen, unable to retrieve data'));
                                    });
                            }

                            // TODO recreate request and return?
                            return Promise.reject(new Error('Body was of type "text/html" but no SAMLRequest was found in the text'))
                        });
                }
                return response;
            });
    };

    /**
     * Make a REST call to the gatekeeper.
     *
     * @param {String} path The path to be added to the gatekeeper url
     * @param {object} request The request object for the window.fetch API
     * @returns A promise from the window.fetch API
     */
    gatekeeper = (path, request) => SessionManager.#fetch(this.gatekeeperUrl, path, request);
}

export { SessionManager };
