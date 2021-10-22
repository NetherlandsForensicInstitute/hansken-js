/*
Usage:
```javascript
<script type="text/javascript" src="./src/hanskenAPI.js"></script>
<script type="text/javascript">
    const hansken = new HanskenClient('https://gatekeeper01.test.hansken.holmes.nl/gatekeeper');

    hansken.projects().then((projects) => {
        projects.forEach((project) => {
            document.write(`<li>${project.name}`);
        });
    });
</script>
```
*/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HanskenClient {
    
    constructor(gatekeeper) {
      this.gatekeeper = gatekeeper;
    }

    static #login(base, entityID) {
        window.location.href = `${base}/saml/login?idp=${encodeURIComponent(entityID)}&redirectUrl=${encodeURIComponent(window.location.href)}`;
        return Promise.reject(new Error('Redirecting to login page')); // We won't get here
    }

    static #fetch(base, url, req) {
        // Defaults for Cross Origin Resource Sharing
        const request = req || {};
        request.credentials = 'include';
        request.mode = 'cors';

        // TODO accept Request as argument
        return window.fetch(`${base}${url}`, request)
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
                                            return HanskenClient.#login(base, idps[0].entityID);
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
                                                return HanskenClient.#login(base, idp.entityID);
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
     * Get a project by id.
     *
     * @param {string} projectId The uuid of the project
     * @returns A project
     */
    project = (projectId) => HanskenClient.#fetch(this.gatekeeper, `/projects/${projectId}`).then((response) => response.json());

    /**
     * Update an existing project.
     *
     * @param {string} projectId The uuid of the project to update
     * @param {object} project The new project to store for the specified project
     * @returns void
     */
    updateProject = (projectId, project) => HanskenClient.#fetch(this.gatekeeper, `/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
    });

    /**
     * Get all projects.
     *
     * @returns All projects the current user is authorized for
     */
    projects = () => HanskenClient.#fetch(this.gatekeeper, '/projects').then((response) => response.json());

    /**
     * Get all images linked to a specific project.
     *
     * @param {string} projectId The uuid of the project to update
     * @returns An array of images linked to this project
     */
    projectImages = (projectId) => HanskenClient.#fetch(this.gatekeeper, `/projects/${projectId}/images`).then((response) => response.json());

    /**
     * Search for traces in a project.
     * 
     * @param {string} projectId 
     * @param {string|object} query The query as an HQL query string, of a HQL JSON object
     * @param {number} count The maximum amount of traces to return
     * @returns 
     */
    searchTraces = (projectId, query = '', count = 10) => {
        const request = {
            count
        };
        if (typeof query === 'string') {
            request.query = {hql: query};
        } else {
            request.query = query;
        }

        return HanskenClient.#fetch(this.gatekeeper, `/projects/${projectId}/traces/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        }).then((response) => response.json());
    }; 
}
