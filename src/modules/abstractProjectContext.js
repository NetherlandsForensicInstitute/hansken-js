import { ProjectImageContext } from './projectImageContext.js';
import { ProjectSearchContext } from './projectSearchContext.js';
import { SessionManager } from './sessionManager.js';
import { TraceContext } from './traceContext.js';

class AbstractProjectContext {

    /**
     * Create a context for a specific project. This can be used to search in a project or list its images.
     *
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     * @param {'projects' | 'singlefiles'} collection 'projects' or 'singlefiles'
     * @param {UUID} collectionId The project id or single file id
     */
    constructor(sessionManager, collection, collectionId) {
        this.sessionManager = sessionManager;
        this.collection = collection;
        this.collectionId = collectionId;
    }

    /**
     * Delete the project or singlefile.
     *
     * @returns A promise
     */
    delete = () => this.sessionManager.gatekeeper(`/${this.collection}/${this.collectionId}`, {
        method: 'DELETE'
    });

    /**
     * Get the project or singlefile.
     *
     * @returns The project
     */
    get = () => this.sessionManager.gatekeeper(`/${this.collection}/${this.collectionId}`).then(SessionManager.json);

    /**
     * Update an existing project or singlefile.
     *
     * @param {object} project The new project to store for the specified project
     * @returns A promise
     */
    update = (project) => this.sessionManager.gatekeeper(`/${this.collection}/${this.collectionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
    });

    /**
     * Create a ProjectImageContext for a single project or singlefile image by id.
     *
     * @param {UUID} The image id
     * @returns A new ProjectImageContext
     */
    image = (imageId) => new ProjectImageContext(this.sessionManager, this.collectionId, imageId);

    /**
     * Get all images linked to a specific project or singlefile.
     *
     * @returns An array of images linked to this project
     */
    // NOTE: /singlefiles/{singlefileId}/images does not exist, but one can use /projects/{singlefileId}/images
    images = () => this.sessionManager.gatekeeper(`/projects/${this.collectionId}/images`).then(SessionManager.json);

    /**
     * Create a ProjectSearchContext to search for traces, facets, tracelets and more.
     *
     * @returns A new ProjectSearchContext
     */
    search = () => new ProjectSearchContext(this.sessionManager, this.collectionId);

    /**
     * Create a TraceContext to retrieve a trace, its data and more.
     *
     * @param {string | TraceUid} traceUid The traceUid of the trace, format 'imageId:traceId', e.g. '093da8cb-77f8-46df-ac99-ea93aeede0be:0-1-1-a3f'
     * @returns A new TraceContext
     */
    trace = (traceUid) => new TraceContext(this.sessionManager, this.collectionId, traceUid);
}

export { AbstractProjectContext };
