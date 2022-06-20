import { SessionManager } from './sessionManager.js';

class TraceModelContext {

    #traceModel;

    /**
     * Get the default trace model or a project trace model.
     *
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     * @param {UUID} projectId The projectId to get the traceModel from, or undefined when accessing the default trace model.
     */
    constructor(sessionManager, projectId) {
        this.sessionManager = sessionManager;
        this.url = projectId ? `/projects/${projectId}/tracemodel`: `/tracemodel`;
    }

    /**
     * Get the trace model.
     *
     * @returns Promise for the trace model
     */
    get = () => {
        if (!this.#traceModel) {
            this.#traceModel = this.sessionManager.gatekeeper(this.url).then(SessionManager.json);
        }
        return this.#traceModel;
    };

    /**
     * Get a trace model property by its dotted notation, as used in the queries.
     *
     * @param {string} property A dotted trace model property, e.g. `picture.width` or `email.misc.any`
     * @returns A promise for the property model with description, type and unit
     */
    property = (property) => {
        return this.get().then((model) => {
            /*
            Simplified trace model to understand the code below:

            uid,
            name,
            siblingId,
            origins:
                categories:
                    annotated:
                        properties:
                            tags: ?
                            privileged: ?
                    extracted:
                        types:
                            data:
                                keys: [raw, text, ...]
                                properties:
                                    size: ?
                                    hash: {md5: ?}
                            email:
                                misc: {headerField: ?}
                            picture:
                                width: ?
            */

            const split = property.split('\.');
            if (split.length === 1) {
                // For example: uid, name, siblingId (intrinsics)
                if (model.properties[property]) {
                    return model.properties[property];
                }

                // For example: tags, privileged
                for (const category of Object.keys(model.origins.categories)) {
                    const modelCategory = model.origins.categories[category];
                    if (modelCategory.properties && modelCategory.properties[property]) {
                        return modelCategory.properties[property];
                    }
                }
            } else {
                for (const category of Object.keys(model.origins.categories)) {
                    const modelCategory = model.origins.categories[category];

                    if (modelCategory.types && modelCategory.types[split[0]] && modelCategory.types[split[0]].properties) {
                        const modelType = modelCategory.types[split[0]];
                        if (split.length === 2) {
                            // For example: picture.width
                            return modelType.properties[split[1]];
                        }

                        if (modelType.keys && (split.length === 3 || split.length === 4)) {
                            // For example: data.raw.size or data.raw.hash.md5
                            return modelType.properties[split[2]];
                        }
                        if (split.length == 3) {
                            // For example: email.misc.headerField
                            return modelType.properties[split[1]];
                        }
                    }
                }
            }
            return Promise.reject(`Property ${property} not found in trace model`);
        });
    };

    /**
     * Get the model part describing a trace type.
     *
     * @param {string} type The name of the type, without origin or category.
     * @returns A promise for the model of the type
     */
    type = (type) => {
        return this.get().then((model) => {
            for (const category of Object.keys(model.origins.categories)) {
                const modelCategory = model.origins.categories[category];
                if (modelCategory.types && modelCategory.types[type]) {
                    return modelCategory.types[type];
                }
            }
        });
    }
}

export { TraceModelContext };
