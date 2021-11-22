const express = require('express')
const app = express()
const port = 3000

//app.use(express.static('.'));
const path = require('path')
app.use('/', express.static(path.join(__dirname, '/')));
app.use('/src', express.static(path.join(__dirname, '../src')));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
