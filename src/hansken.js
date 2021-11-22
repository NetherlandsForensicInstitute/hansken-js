import { SessionManager } from './modules/sessionManager.js';
import { ProjectContext } from './modules/projectContext.js';

class HanskenClient {
    
    constructor(gatekeeperUrl) {
      this.sessionManager = new SessionManager(gatekeeperUrl);
      
    }

    /**
     * Get all projects.
     *
     * @returns All projects the current user is authorized for
     */
    projects = () => this.sessionManager.gatekeeper('/projects').then((response) => response.json());

    project = (projectId) => new ProjectContext(sessionManager, projectId);

    /**
     * Search for traces in a project.
     * 
     * @param {string} projectId 
     * @param {string|object} query The query as an HQL query string, of a HQL JSON object
     * @param {number} count The maximum amount of traces to return
     * @returns 
     */
/*    searchTraces = (projectId, query = '', count = 10) => {
        const request = {
            count
        };
        if (typeof query === 'string') {
            request.query = {human: query};
        } else {
            request.query = query;
        }

        return HanskenClient.fetch(this.gatekeeper, `/projects/${projectId}/traces/search`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        }).then((response) => response.json());
    }; */
}

export { HanskenClient };