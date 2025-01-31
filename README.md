# Hansken Javascript Client

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

# Development
```
nvm install 14.21.3
npm install --global gulp@4.0.2
```

Start demo server:
`node examples/app.js`

Build project:
`gulp`
