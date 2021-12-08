import { ProjectImageContext } from './projectImageContext.js';
import { ProjectSearchContext } from './projectSearchContext.js';

class ProjectContext {

    /**
     * Create a context for a specific project. This can be used to search in a project or list its images.
     * 
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     * @param {UUID} projectId The project id
     */
    constructor(sessionManager, projectId) {
        this.sessionManager = sessionManager;
        this.projectId = projectId;
    }

    /**
     * Get the project.
     *
     * @returns The project
     */
    get = () => this.sessionManager.gatekeeper(`/projects/${this.projectId}`).then(this.sessionManager.toJson);

    /**
     * Update an existing project.
     *
     * @param {object} project The new project to store for the specified project
     * @returns A promise
     */
    update = (project) => this.sessionManager.gatekeeper(`/projects/${this.projectId}`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
    });

    /**
     * Get all images linked to a specific project.
     *
     * @returns An array of images linked to this project
     */
    images = () => this.sessionManager.gatekeeper(`/projects/${this.projectId}/images`).then(this.sessionManager.toJson);

    /**
     * Create a ProjectImageContext for a single project image by id.
     * 
     * @param {UUID} The image id
     * @returns A new ProjectImageContext
     */
    image = (imageId) => new ProjectImageContext(this.sessionManager, this.projectId, imageId);

    /**
     * Create a ProjectSearchContext to search for traces, facets, tracelets and more.
     * 
     * @returns A new ProjectSearchContext
     */
    search = () => new ProjectSearchContext(this.sessionManager, this.projectId);
}

export { ProjectContext };
