import { ProjectImageContext } from './projectImageContext.js';

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
    get = () => this.sessionManager.gatekeeper(`/projects/${this.projectId}`).then((response) => response.json());

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
    images = () => this.sessionManager.gatekeeper(`/projects/${this.projectId}/images`).then((response) => response.json());

    /**
     * Create an ProjectImageContext for a single project image by id.
     * 
     * @param {UUID} The image id
     * @returns A new ProjectImageContext
     */
    image = (imageId) => new ProjectImageContext(this.sessionManager, this.projectId, imageId);

    /**
     * Search for traces in a project.
     * 
     * @param {string} projectId 
     * @param {string|object} query The query as an HQL query string, of a HQL JSON object
     * @param {number} count The maximum amount of traces to return
     * @returns 
     */
    /*searchTraces = (query = '', count = 10) => {
        const request = {
            count
        };
        if (typeof query === 'string') {
            request.query = {human: query};
        } else {
            request.query = query;
        }

        return this.sessionManager.gatekeeper(`/projects/${this.projectId}/traces/search`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        }).then((response) => response.json());
    }; */
}

export { ProjectContext };
