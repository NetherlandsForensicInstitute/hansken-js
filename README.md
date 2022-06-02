# Hansken Javascript Client
Work in progress

## Installation
Install via NPM:

```bash
npm install hansken-js
```

## Usage
```javascript
import {HanskenClient} from './src/hansken-js.js';

const hansken = new HanskenClient('/gatekeeper', '/keystore');
hansken.projects().then((projects) => {
    projects.forEach((project) => {
        document.write(`<li><a href="project-images.html?projectId=${project.id}">${project.name}</a>`);
    });
});
```

## Examples
Start examples with `node examples/app.js`
