class TraceUid {

    /**
     * Create a TraceUid object from imageId and traceId.
     *
     * @param {string} imageId The imageId of the trace, e.g. '093da8cb-77f8-46df-ac99-ea93aeede0be'
     * @param {string} traceId The traceId of the trace, e.g. '0-1-1-a3f'
     */
    constructor(imageId, traceId) {
        this.imageId = imageId;
        this.traceId = traceId;
        this.traceUid = `${this.imageId}:${this.traceId}`;
        Object.freeze(this); // Makes properties immutable
    }

    /**
     * Parse a traceUid string to a TraceUid object.
     *
     * @param {string} traceUid The traceUid of the trace, format 'imageId:traceId', e.g. '093da8cb-77f8-46df-ac99-ea93aeede0be:0-1-1-a3f'
     * @returns A TraceUid object or undefined
     */
    static fromString = (traceUid) => {
        const semicolon = traceUid.indexOf(':');
        if (semicolon != 36 || traceUid.length < 37) {
            return;
        }
        return new TraceUid(traceUid.substring(0, semicolon), traceUid.substring(semicolon + 1));
    };
}

export { TraceUid };
