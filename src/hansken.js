import { SessionManager } from './modules/sessionManager.js';
import { ProjectContext } from './modules/projectContext.js';

class HanskenClient {

    /**
     * Creates a client to obtain information via the Hansken REST API. SAML session handling is done by this client.
     *
     * @param {String} gatekeeperUrl The url to the Hansken gatekeeper, without trailing '/'
     */
    constructor(gatekeeperUrl) {
        this.sessionManager = new SessionManager(gatekeeperUrl);
    }

    /**
     * Get all projects.
     *
     * @returns All projects the current user is authorized for
     */
    projects = () => this.sessionManager.gatekeeper('/projects').then((response) => response.json());

    /**
     * Get a context for a single project, to do project specific REST calls.
     *
     * @param {UUID} projectId The project id
     * @returns A ProjectContext
     */
    project = (projectId) => new ProjectContext(this.sessionManager, projectId);
}

export { HanskenClient };
