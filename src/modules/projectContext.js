import { ProjectImageContext } from './projectImageContext.js';
import { ProjectSearchContext } from './projectSearchContext.js';

class ProjectContext {

    /**
     * Create a context for a specific project. This can be used to search in a project or list its images.
     *
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     * @param {UUID} id The project id or single file id
     * @param {'projects' | 'singlefiles'} collection 'projects' or 'singlefiles'
     */
    constructor(sessionManager, projectId, collection) {
        this.sessionManager = sessionManager;
        this.id = id;
        this.collection = collection;
    }

    /**
     * Delete the project or singlefile.
     *
     * @returns A promise
     */
    delete = () => this.sessionManager.gatekeeper(`/${this.collection}/${this.id}`, {
        method: 'DELETE'
    });

    /**
     * Get the project or singlefile.
     *
     * @returns The project
     */
    get = () => this.sessionManager.gatekeeper(`/${this.collection}/${this.id}`).then(this.sessionManager.toJson);

    /**
     * Update an existing project or singlefile.
     *
     * @param {object} project The new project to store for the specified project
     * @returns A promise
     */
    update = (project) => this.sessionManager.gatekeeper(`/${this.collection}/${this.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
    });

    /**
     * Get all images linked to a specific project or singlefile.
     *
     * @returns An array of images linked to this project
     */
    images = () => this.sessionManager.gatekeeper(`/${this.collection}/${this.id}/images`).then(this.sessionManager.toJson);

    /**
     * Create a ProjectImageContext for a single project or singlefile image by id.
     *
     * @param {UUID} The image id
     * @returns A new ProjectImageContext
     */
    image = (imageId) => new ProjectImageContext(this.sessionManager, this.id, imageId);

    /**
     * Create a ProjectSearchContext to search for traces, facets, tracelets and more.
     *
     * @returns A new ProjectSearchContext
     */
    search = () => new ProjectSearchContext(this.sessionManager, this.id);
}

export { ProjectContext };
