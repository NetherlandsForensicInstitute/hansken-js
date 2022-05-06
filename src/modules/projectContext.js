import { ProjectImageContext } from './projectImageContext.js';
import { ProjectSearchContext } from './projectSearchContext.js';
import { TraceUid } from './traceUid.js';

class ProjectContext {

    /**
     * Create a context for a specific project. This can be used to search in a project or list its images.
     *
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     * @param {UUID} id The project id or single file id
     * @param {'projects' | 'singlefiles'} collection 'projects' or 'singlefiles'
     */
    constructor(sessionManager, id, collection) {
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
    // NOTE: /singlefiles/{singlefileId}/images does not exist, but one can use /projects/{singlefileId}/images
    images = () => this.sessionManager.gatekeeper(`/projects/${this.id}/images`).then(this.sessionManager.toJson);

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

    /**
     * Get the data from a trace as array buffer.
     *
     * @param {string} traceUid The traceUid of the trace, format 'imageId:traceId', e.g. '093da8cb-77f8-46df-ac99-ea93aeede0be:0-1-1-a3f'
     * @param {string} dataType The name of the data stream, as described in the trace, e.g. 'raw', 'text', 'ocr'
     * @param {number} start Optional: The start of a subrange, inclusive. See spec https://tools.ietf.org/html/rfc7233#section-2.1
     * @param {number} end Optional: The end of a subrange, inclusive. See spec https://tools.ietf.org/html/rfc7233#section-2.1
     */
     data = (traceUid, dataType, start = 0, end) => {
        const uid = TraceUid.fromString(traceUid);
        return this.sessionManager.keyManager().getKeyHeaders(uid.imageId).then((headers) =>
            this.sessionManager.gatekeeper(`/projects/${this.id}/traces/${uid.traceUid}/data?dataType=${dataType}`, {
                method: 'GET',
                headers: {
                    ...headers,
                    Range: `bytes=${start}-${end || ''}`
                }
            }).then((response) => response.arrayBuffer()));
    };
}

export { ProjectContext };
