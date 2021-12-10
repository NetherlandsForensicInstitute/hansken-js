class ProjectSearchContext {

    /**
     * Create a search context for a specific project. This can be used to search for traces.
     * 
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     * @param {UUID} projectId The project id
     */
    constructor(sessionManager, projectId) {
        this.sessionManager = sessionManager;
        this.projectId = projectId;
    }

    /**
     * Search for traces in a project.
     * 
     * @param {string|object} request The query as an HQL query string, or the full REST request for the /search
     * @returns 
     */
    traces = (request = '') => {
        const searchRequest = typeof request === 'string' ? {query: {human: request}} : request;

        return this.sessionManager.gatekeeper(`/projects/${this.projectId}/traces/search`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchRequest)
        }).then(this.sessionManager.toJson);
    };

    /**
     * Search for traces in a project and map every trace to the callback.
     * 
     * @param {string|object} request The query as an HQL query string, or the full REST request for the /search
     * @param {function} callback The callback that receives a trace result object
     * @returns 
     */
    tracesMap = (request = '', callback) => {
        const searchRequest = typeof request === 'string' ? {query: {human: request}} : request;
        searchRequest.facets = []; // No facets allowed in streaming

        const searchResultRegex = /^(\{("[a-z0-9]+"\:\s?("[a-z0-9]+"|[0-9]+|\[\]),?\s?)*"traces"\:\s?\[)/i

        return this.sessionManager.gatekeeper(`/projects/${this.projectId}/traces/search`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchRequest)
        }).then((response) => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let buffer = '';
            let searchResult;

            return reader.read().then(function processData({done, value}) {
                if (done) {
                    // The current buffer contains the closing json of the search result.
                    // So let's complete this function with the json object without the trace objects
                    return Promise.resolve(JSON.parse(searchResult + buffer));
                }
            
                // value for fetch streams is an Uint8Array
                buffer += decoder.decode(value); // Note: not every byte is a single character!

                if (!searchResult) {
                    // The root element is the trace search result
                    const result = buffer.match(searchResultRegex);
                    if (!result) {
                        return reader.read().then(processData);
                    }
                    buffer = buffer.substring(result[0].length);
                    searchResult = result[0];
                }

                if (buffer.length === 0) {
                    return reader.read().then(processData);    
                }

                let start = 0;
                let depth = 1;
                let inEscape = false;
                let inQuote = false;
                for (let i = 1; i < buffer.length; i++) {
                    const character = buffer[i];

                    if (character === '\\') {
                        inEscape = !inEscape;
                    } else if (!inEscape) {
                        if (character === '"') {
                            inQuote = !inQuote;
                        } else if (!inQuote) {
                            if (character === '{') {
                                if (depth === 0) {
                                    start = i;
                                }
                                depth++;
                            }
                            else if (character === '}') {
                                depth--;
                                if (depth === 0) {
                                    callback(JSON.parse(buffer.substring(start, i + 1))); // TODO expect Promise?
                                    start = i + 1;
                                }
                            }
                        }
                    } else {
                        inEscape = false;
                    }
                }

                buffer = buffer.substring(start);
                return reader.read().then(processData);
            });
        });
    };
}

export { ProjectSearchContext };
