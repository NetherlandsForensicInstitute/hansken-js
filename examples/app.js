const express = require('express');
const app = express();
const port = 3000;

const path = require('path');
app.use('/', express.static(path.join(__dirname, '/')));
app.use('/src', express.static(path.join(__dirname, '../src')));

app.get('/gatekeeper/projects', (req, res) => {
  res.json([{
    id: 'de554b81-e4a3-4759-96ec-0abf942be72c',
    name: 'Cold case 1994',
    createdBy: 'john.doe@keycloak.hansken.local',
    description: 'A case that started in the winter of 1994',
    type: 'cybercrime',
    lastModifiedDate: '2021-11-10T00:00:00.000Z',
    createdDate: '2021-11-09T13:42:35.947Z',
    priority: 3
  }, {
    id: '1a85b2d2-972a-4131-86f7-f55b61b19158',
    name: 'Dummy project',
    description: 'Project with no images',
    createdBy: 'user.name@keycloak.hansken.local',
    type: 'other',
    startDate: '2021-09-01T00:00:00.000Z',
    lastAccessedDate: '2021-09-07T00:00:00.000Z',
    lastModifiedDate: '2021-09-01T00:00:00.000Z',
    createdDate: '2021-09-01T08:01:15.330Z',
    priority: 3
  }]);
});

app.get('/gatekeeper/projects/de554b81-e4a3-4759-96ec-0abf942be72c/images', (req, res) => {
  res.json([{
    id: '1a85b2d2-972a-4131-86f7-f55b61b19158',
    description: 'Laptop',
    createdBy: 'john.doe@keycloak.hansken.local',
    createdDate: '2019-09-10T13:22:10.051Z',
    states: [{
      date: '2021-11-10T23:18:30.719Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'unextracted'
    }, {
      date: '2021-11-10T23:18:31.045Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'queued'
    }, {
      date: '2021-11-10T23:18:31.362Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'cleaning'
    }, {
      date: '2021-11-10T23:18:31.495Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'preparing'
    }, {
      date: '2021-11-10T23:18:31.575Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'extracting'
    }, {
      date: '2021-11-10T23:29:58.161Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'extracted'
    }]
  }, {
    id: '6289e036-c16b-41e0-a3cd-c736dadcdb53',
    description: 'Mobile phone',
    createdBy: 'john.doe@keycloak.hansken.local',
    createdDate: '2019-09-10T13:22:10.051Z',
    states: [{
      date: '2021-11-10T23:18:27.139Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'unextracted'
    }, {
      date: '2021-11-10T23:18:27.451Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'queued'
    }, {
      date: '2021-11-10T23:18:27.741Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'cleaning'
    }, {
      date: '2021-11-10T23:18:27.859Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'preparing'
    }, {
      date: '2021-11-10T23:18:27.912Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'extracting'
    }, {
      date: '2021-11-10T23:38:30.296Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'extracted'
    }, {
      date: '2021-11-12T07:01:38.936Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'unextracted'
    }, {
      date: '2021-11-12T07:01:39.387Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'queued'
    }, {
      date: '2021-11-12T07:01:39.648Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'cleaning'
    }, {
      date: '2021-11-12T07:01:47.387Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'preparing'
    }, {
      date: '2021-11-12T07:01:47.472Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'extracting'
    }, {
      date: '2021-11-12T07:14:24.563Z',
      projectId: 'de554b81-e4a3-4759-96ec-0abf942be72c',
      state: 'extracted'
    }]
  }]);
});

app.listen(port, () => {
  console.log(`Example server started at http://localhost:${port}`);
});
