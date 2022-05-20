import { SessionManager } from './sessionManager.js';

class ProjectImageContext {

    /**
     * Create a context for a specific project image. This can be used to update or get image metadata.
     *
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     * @param {UUID} projectId The project id
     * @param {UUID} imageId The project image id
     */
    constructor(sessionManager, projectId, imageId) {
        this.sessionManager = sessionManager;
        this.projectId = projectId;
        this.imageId = imageId;
    }

    /**
     * Get the project image.
     *
     * @returns The project image
     */
    get = () => this.sessionManager.gatekeeper(`/projects/${this.projectId}/images/${this.imageId}`).then(SessionManager.toJson);

    /**
     * Update an existing project image.
     *
     * @param {object} image The new image to store for the specified project
     * @returns void
     */
    update = (image) => this.sessionManager.gatekeeper(`/projects/${this.projectId}/images/${this.imageId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(image)
    });
}

export { ProjectImageContext };
