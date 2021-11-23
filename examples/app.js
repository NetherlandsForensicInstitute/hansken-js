const express = require('express');
const app = express();
const port = 3000;

const path = require('path');
app.use('/', express.static(path.join(__dirname, '/')));
app.use('/src', express.static(path.join(__dirname, '../src')));


app.get('/gatekeeper/projects', (req, res) => {
  res.json([{
    id: '8dc89212-4c3e-11ec-81d3-0242ac130003',
    name: 'Cold case 1994',
    description: 'A case that started in the winter of 1994'
  }]);
});

app.get('/gatekeeper/projects/8dc89212-4c3e-11ec-81d3-0242ac130003/images', (req, res) => {
  res.json([{
    id: '1a85b2d2-972a-4131-86f7-f55b61b19158',
    description: 'Laptop'
  }, {
    id: '6289e036-c16b-41e0-a3cd-c736dadcdb53',
    description: 'Mobile phone'
  }]);
});

app.listen(port, () => {
  console.log(`Example server started at http://localhost:${port}`);
});
