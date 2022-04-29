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
     * Get all single files.
     *
     * @returns All single files the current user is authorized for
     */
    singlefiles = () => this.sessionManager.gatekeeper('/singlefiles').then((response) => response.json());

    /**
     * Get a context for a single project, to do project specific REST calls.
     *
     * @param {UUID} projectId The project id
     * @returns A ProjectContext for a project
     */
    project = (projectId) => new ProjectContext(this.sessionManager, projectId, 'projects');

    /**
     * Get a context for a single file, to do project specific REST calls.
     *
     * @param {UUID} projectId The single file id
     * @returns A ProjectContext for a single file
     */
     singlefile = (projectId) => new ProjectContext(this.sessionManager, projectId, 'singlefiles');
}

export { HanskenClient };
