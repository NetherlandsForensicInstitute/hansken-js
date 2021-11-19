import { SessionManager } from './modules/sessionManager.js';
import { Projects } from './modules/projects.js';

class HanskenClient {
    
    constructor(gatekeeperUrl) {
      const sessionManager = new SessionManager(gatekeeperUrl);
      this.projects = new Projects(sessionManager);
    }

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