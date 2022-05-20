import { ProjectSinglefileContext } from './projectSinglefileContext.js';
import { SessionManager } from './sessionManager.js';

class ProjectContext extends ProjectSinglefileContext {

    /**
     * Create a context for a specific project. This can be used to search in a project or list its images.
     *
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     * @param {UUID} collectionId The project id or single file id
     */
    constructor(sessionManager, collectionId) {
        super(sessionManager, 'projects', collectionId);
    }

    /**
     * Create an image and link it to the project.
     * This method should not be used with singlefiles.
     *
     * @param {object} image The image as specified in the REST API docs.
     * @returns The image id
     */
    createImage = (image) => this.sessionManager.gatekeeper('/images', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(image)
    }).then(SessionManager.parseLocationId)
    .then(this.linkImage);

    /**
     * Link an image to this project.
     * This method should not be used with singlefiles.
     *
     * @param {UUID} imageId The image id
     * @returns The new ProjectImageContext
     */
    linkImage = (imageId) => this.sessionManager.gatekeeper(`/projects/${this.collectionId}/images/${imageId}`, {
        method: 'PUT'
    }).then(() => this.image(imageId));

    /**
     * Unlink an image from this project.
     * This method should not be used with singlefiles.
     *
     * @param {UUID} imageId The image id
     * @returns The image id
     */
    unlinkImage = (imageId) => this.sessionManager.gatekeeper(`/projects/${this.collectionId}/images/${imageId}`, {
        method: 'DELETE'
    });
}

export { ProjectContext };
