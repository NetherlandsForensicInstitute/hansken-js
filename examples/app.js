const express = require('express');
const app = express();
const port = 3000;

const path = require('path');
app.use('/', express.static(path.join(__dirname, '/')));
app.use('/src', express.static(path.join(__dirname, '../src')));

app.listen(port, () => {
  console.log(`Example server started at http://localhost:${port}`);
});
