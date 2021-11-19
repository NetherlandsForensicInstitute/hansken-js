class ProjectImageContext {

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
    get = () => this.sessionManager.gatekeeper(`/projects/${this.projectId}/images/${this.imageId}`).then((response) => response.json());

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