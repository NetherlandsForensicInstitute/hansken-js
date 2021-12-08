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
     * @param {string} projectId 
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
}

export { ProjectSearchContext };
