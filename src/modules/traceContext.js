import { TraceUid } from './traceUid.js';

class TraceContext {

    /**
     * Creates a context for a specific trace.
     *
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     * @param {UUID} collectionId The project id or single file id
     * @param {string | TraceUid} traceUid The traceUid of the trace, format 'imageId:traceId', e.g. '093da8cb-77f8-46df-ac99-ea93aeede0be:0-1-1-a3f'
     * @param {Map} customProjectHeaders A map of custom headers to add to every /projects/* REST request
     */
     constructor(sessionManager, collectionId, traceUid, customProjectHeaders = {}) {
        this.sessionManager = sessionManager;
        this.collectionId = collectionId;
        this.traceUid = typeof traceUid === 'string' ? TraceUid.fromString(traceUid) : traceUid;
        this.customProjectHeaders = customProjectHeaders;
    }

    /**
     * Get the data from a trace as array buffer.
     *
     * @param {string} dataType The name of the data stream, as described in the trace, e.g. 'raw', 'text', 'ocr'
     * @param {number} start Optional: The start of a subrange, inclusive. See spec https://tools.ietf.org/html/rfc7233#section-2.1
     * @param {number} end Optional: The end of a subrange, inclusive. See spec https://tools.ietf.org/html/rfc7233#section-2.1
     * @returns The data in an array buffer
     */
     data = (dataType, start = 0, end) => {
        return this.sessionManager.keyManager().getKeyHeaders(this.traceUid.imageId).then((headers) =>
            this.sessionManager.gatekeeper(`/projects/${this.collectionId}/traces/${this.traceUid.traceUid}/data?dataType=${dataType}`, {
                method: 'GET',
                headers: {
                    ...headers,
                    ...this.customProjectHeaders,
                    Range: `bytes=${start}-${end || ''}`
                }
            }).then((response) => response.arrayBuffer()));
    };

    /**
     * Add a tag to this trace.
     *
     * @param {string} tag Text to be added as tag, usually a single word
     * @param {boolean} refresh Default set to `true` to refresh the project index after the tag is added.
     *     This makes sure the tag is directly searchable, but is also slower for larger add operations.
     *     In case of large amounts of add operations, it is better to set refresh to `false` and let Hansken decide when the index should be refreshed or call refresh on the last added tag.
     *     Usage: `addTag('foo', {refresh: false});`
     * @returns The promise of the response
     */
    addTag = (tag, {refresh = true} = {}) => {
        console.log(refresh);
        return this.sessionManager.gatekeeper(`/projects/${this.collectionId}/traces/${this.traceUid.traceUid}/tags/${window.encodeURIComponent(tag)}`, {
            method: 'PUT',
            headers: {
                'Hansken-Project-Refresh': refresh ? 'refresh' : 'no-refresh',
                ...this.customProjectHeaders
            }
        });
    };

    /**
     * Remove a tag from this trace.
     *
     * @param {string} tag Text to be removed as tag, usually a single word
     * @param {boolean} refresh Default set to `true` to refresh the project index after the tag is removed.
     *     This makes sure the tag is directly removed from the search results, but is also slower for larger remove operations.
     *     In case of large amounts of remove operations, it is better to set refresh to `false` and let Hansken decide when the index should be refreshed or call refresh on the last removed tag.
     *     Usage: `removeTag('foo', {refresh: false});`
     * @returns The promise of the response
     */
    removeTag = (tag, {refresh = true} = {}) => {
        console.log(refresh);
        return this.sessionManager.gatekeeper(`/projects/${this.collectionId}/traces/${this.traceUid.traceUid}/tags/${window.encodeURIComponent(tag)}`, {
            method: 'DELETE',
            headers: {
                'Hansken-Project-Refresh': refresh ? 'refresh' : 'no-refresh',
                ...this.customProjectHeaders
            }
        });
    };
}

export { TraceContext };
