'use strict';

const express = require('express');
const _ = require('lodash');

const app = express();
app.use(express.json());
const port = 3000;

// Mocks
const searchResultMock = require('./mocks/searchResult.json');
const traceResultMock = require('./mocks/traceResult.json');
const traceMock = require('./mocks/trace.json');

// Static directories
const path = require('path');
app.use('/', express.static(path.join(__dirname, '/')));
app.use('/src', express.static(path.join(__dirname, '../src')));
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));

app.get('/gatekeeper/projects', (request, response) => {
    response.json(require('./mocks/projects.json'));
});

app.get('/gatekeeper/projects/de554b81-e4a3-4759-96ec-0abf942be72c/images', (request, response) => {
    response.json(require('./mocks/projectImagesColdCase.json'));
});

app.post('/gatekeeper/projects/de554b81-e4a3-4759-96ec-0abf942be72c/traces/search', (request, response) => {
    const count = _.get(request.body, 'count', 10);

    const searchResult = {...searchResultMock};
    searchResult.traces = [];

    for (let i = 0; i < count; i++) {
        const trace = {...traceMock};
        trace.id = trace.id + '-' + i.toString(16);
        trace.uid = trace.uid + '-' + i.toString(16);

        let traceResult = {...traceResultMock};

        traceResult.trace = trace;
        traceResult.score = Math.random();
        traceResult.project = 'de554b81-e4a3-4759-96ec-0abf942be72c';

        searchResult.traces.push(traceResult);
    }
    
    response.json(searchResult);
});


app.listen(port, () => {
    console.log(`Example server started at http://localhost:${port}`);
});
