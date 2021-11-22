import { ProjectImageContext } from './projectImageContext.js';

class ProjectContext {

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
     * @param {string} projectId The uuid of the project to update
     * @param {object} project The new project to store for the specified project
     * @returns void
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
     * @param {string} projectId The uuid of the project to update
     * @returns An array of images linked to this project
     */
    images = () => this.sessionManager.gatekeeper(`/projects/${this.projectId}/images`).then((response) => response.json());

    image = (imageId) => new ProjectImageContext(this.sessionManager, this.projectId, imageId);
}

export { ProjectContext };
