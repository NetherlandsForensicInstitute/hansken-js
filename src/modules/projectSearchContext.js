import { SessionManager } from './sessionManager.js';

class ProjectSearchContext {

    /**
     * Create a search context for a specific project. This can be used to search for traces.
     *
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     * @param {UUID} collectionId The project id
     * @param {Map} customProjectHeaders A map of custom headers to add to every /projects/* REST request
     */
    constructor(sessionManager, collectionId, customProjectHeaders = {}) {
        this.sessionManager = sessionManager;
        this.collectionId = collectionId;
        this.customProjectHeaders = customProjectHeaders;
    }

    static #tryObjectParse = (buffer, callback) => {
        if (buffer.length <= 1) {
            return 0;
        }

        let start = 0;
        let inObject = false;

        for (let i = 0; i < buffer.length; i++) {
            const character = buffer.charAt(i);

            if (!inObject && character === '{') {
                // This is the first encounter of an JSON object
                inObject = true;
                start = i;
            }
            else if (inObject && character === '}') {
                // Whenever we come across an JSON object end, try to parse the part that we read
                // The JSON.parse will throw an exception when the token is not complete (missing })
                // and we'll try to parse the next time
                try {
                    const trace = JSON.parse(buffer.substring(start, i + 1));
                    start = i + 1;
                    inObject = false;
                    callback(trace);
                } catch {
                }
            }
        }
        return start;
    }

    /**
     * Search for traces in a project and map every trace to the callback.
     *
     * @param {string|object} request The query as an HQL query string, or the full REST request for the /search
     * @param {function} callback The callback that receives a trace result object. Note: facets are not allowed when streaming (not implemented)
     * @returns A promise with the trace result without traces
     */
    #streamingTraces = (request = '', callback) => {
        const searchRequest = typeof request === 'string' ? {query: {human: request}} : request;
        searchRequest.facets = []; // No facets allowed in streaming for now as the regex below doesn't understand them

        // Regex to read all search result fields until the "traces": [] field, where the array will be further processed
        const searchResultRegex = /^(\{("[a-z0-9]+"\:\s?("[a-z0-9]+"|[0-9]+|\[\]),?\s?)*"traces"\:\s?\[)/i

        return this.sessionManager.gatekeeper(`/projects/${this.collectionId}/traces/search`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...this.customProjectHeaders
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

                const start = ProjectSearchContext.#tryObjectParse(buffer, callback);

                buffer = buffer.substring(start);
                return reader.read().then(processData);
            });
        });
    };

    /**
     * Search for traces in a project.
     *
     * @param {string|object} request The query as an HQL query string, or the full REST request for the /search
     * @param {function} callback When provided, all trace results are fed to the callback. This can be used to process large trace results, as the JSON parsing is streaming
     * @returns A promise with the trace result. Note that when given a callback, the traces array in the search result is empty
     */
     traces = (request = '', callback) => {
        if (typeof callback === 'function') {
            return this.#streamingTraces(request, callback);
        }
        const searchRequest = typeof request === 'string' ? {query: {human: request}} : request;

        return this.sessionManager.gatekeeper(`/projects/${this.collectionId}/traces/search`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...this.customProjectHeaders
            },
            body: JSON.stringify(searchRequest)
        }).then(SessionManager.json);
    };
}

export { ProjectSearchContext };
