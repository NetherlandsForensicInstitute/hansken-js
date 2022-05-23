import { AbstractProjectContext } from './abstractProjectContext.js';
import { SessionManager } from './sessionManager.js';

class SinglefileContext extends AbstractProjectContext {

    /**
     * Create a context for a specific project. This can be used to search in a project or list its images.
     *
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     * @param {UUID} collectionId The project id or single file id
     */
    constructor(sessionManager, collectionId) {
        super(sessionManager, 'singlefiles', collectionId);
    }
}

export { SinglefileContext };
