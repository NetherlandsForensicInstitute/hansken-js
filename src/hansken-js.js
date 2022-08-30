import { ProjectContext } from './modules/projectContext.js';
import { SinglefileContext } from './modules/singefileContext.js';
import { Scheduler } from './modules/scheduler.js';
import { SessionManager } from './modules/sessionManager.js';
import { TraceModelContext } from './modules/traceModelContext.js';

class HanskenClient {

    #scheduler;
    #traceModelContexts = {}; // {projectId, traceModelContext}

    /**
     * Creates a client to obtain information via the Hansken REST API. SAML session handling is done by this client.
     *
     * @param {string} gatekeeperUrl The url to the Hansken gatekeeper
     * @param {string} keystoreUrl The url to the Hansken keystore
     */
    constructor(gatekeeperUrl, keystoreUrl) {
        this.sessionManager = new SessionManager(gatekeeperUrl, keystoreUrl);
    }

    /**
     * Create a new project.
     *
     * @param {object} project The project as specified in the REST API docs.
     * @returns A ProjectContext for the new project
     */
    createProject = (project) => this.sessionManager.gatekeeper(`/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
    }).then(SessionManager.parseLocationId)
    .then(this.project);

    /**
     * Get a context for a single project, to do project specific REST calls.
     *
     * @param {UUID} projectId The project id
     * @param {Map} customProjectHeaders A map of custom headers to add to every /projects/* REST request
     * @returns A ProjectContext for a project
     */
    project = (projectId, customProjectHeaders = {}) => new ProjectContext(this.sessionManager, projectId, customProjectHeaders);

    /**
     * Get all projects.
     *
     * @returns All projects the current user is authorized for
     */
    projects = () => this.sessionManager.gatekeeper(`/projects`).then((response) => response.json());

    /**
     * Create a new singlefile.
     *
     * @param {string} name The name for the singlefile
     * @param {Blob | BufferSource | ReadableStream} data The data of the singlefile
     * @returns The singlefile id
     */
    createSinglefile = (name, data) => this.sessionManager.gatekeeper(`/singlefiles/upload/${name}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream'
        },
        body: data
    }).then(SessionManager.parseLocationId);

    /**
     * Retrieve and store keys from the Hansken keystore.
     *
     * @returns The keystore manager
     */
    keyManager = () => this.sessionManager.keyManager();

    /**
     * Create a session context for a specific service. (gatekeeper or keystore).
     *
     * @param {'gatekeeper' | ' keystore'} serviceName The name of the service
     * @returns A SessionContext for the service
     */
    session = (serviceName) => this.sessionManager.session(serviceName);

    /**
     * Get a context for a single file, to do project specific REST calls.
     *
     * @param {UUID} singlefileId The single file id
     * @returns A ProjectContext for a single file
     */
    singlefile = (singlefileId) => new SinglefileContext(this.sessionManager, singlefileId);

    /**
     * Get all single files.
     *
     * @returns All single files the current user is authorized for
     */
    singlefiles = () => this.sessionManager.gatekeeper(`/singlefiles`).then((response) => response.json());

    /**
     * Get the scheduler to start and monitor tasks.
     *
     * @returns The task scheduler
     */
    scheduler = () => {
        if (!this.#scheduler) {
            this.#scheduler = new Scheduler(this.sessionManager);
        }
        return this.#scheduler;
    };

    /**
     * Retrieve a list of all tools that are available for an extraction.
     *
     * @returns A Promise with the list of all available tools
     */
     tools = () => this.sessionManager.gatekeeper(`/tools`).then(SessionManager.json);

     /**
      * The tool builder is a simple wrapper around the tools list, to enable or disable tools.
      * The build() result can be used in an extraction request.
      *
      * @returns A Promise with a tool builder
      */
     toolsBuilder = () => this.tools().then(tools => {
         const enabledTools = {...tools};
         return {
             /**
              * Enable a tool to be used in an extraction.
              *
              * @param {string} name The name of the tool
              * @returns this builder
              */
             enable: function(name) {
                 if (enabledTools[name]) {
                     enabledTools[name].defaultEnabled = true;
                     return this;
                 }
                 throw `Tool "${name}" does not exist`;
             },
             /**
              * Disable a tool so it will not be used in an extraction.
              *
              * @param {string} name The name of the tool
              * @returns this builder
              */
             disable: function(name) {
                 if (enabledTools[name]) {
                     enabledTools[name].defaultEnabled = false;
                     return this;
                 }
                 throw `Tool "${name}" does not exist`;
             },
             /**
              * Build an array of all enabled tool names.
              *
              * @returns An array of all enabled tools names to be used in an extraction request: `{tools: builder.build()}`
              */
             build: function() {
                 return Object.keys(enabledTools).filter(tool => tools[tool].defaultEnabled);
             }
         };
     });

    /**
     * Get the default trace model or a project trace model.
     *
     * @param {UUID} projectId The projectId to get the traceModel from, or don't provide one to use the default trace model.
     * @returns A traceModel context
     */
    traceModel = (projectId) => {
        // Uses 'undefined' as string for the default model
        if (!this.#traceModelContexts[`${projectId}`]) {
            this.#traceModelContexts[`${projectId}`] = new TraceModelContext(this.sessionManager, projectId);
        }
        return this.#traceModelContexts[`${projectId}`];
    }
}

export { HanskenClient };
