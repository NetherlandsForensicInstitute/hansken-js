class Projects {

    constructor(sessionManager) {
        this.sessionManager = sessionManager;
    }

    /**
     * Get a project by id.
     *
     * @param {string} projectId The uuid of the project
     * @returns A project
     */
    get = (projectId) => this.sessionManager.gatekeeper(`/projects/${projectId}`).then((response) => response.json());

    /**
     * Update an existing project.
     *
     * @param {string} projectId The uuid of the project to update
     * @param {object} project The new project to store for the specified project
     * @returns void
     */
    update = (projectId, project) => this.sessionManager.gatekeeper(`/projects/${projectId}`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
    });

    /**
     * Get all projects.
     *
     * @returns All projects the current user is authorized for
     */
    list = () => this.sessionManager.gatekeeper('/projects').then((response) => response.json());

    /**
     * Get all images linked to a specific project.
     *
     * @param {string} projectId The uuid of the project to update
     * @returns An array of images linked to this project
     */
    images = (projectId) => this.sessionManager.gatekeeper(`/projects/${projectId}/images`).then((response) => response.json());
}

export { Projects };
