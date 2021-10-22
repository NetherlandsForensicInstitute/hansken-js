# Hansken Javascript Client
Work in progress

```javascript
<script type="text/javascript" src="hanskenAPI.js"></script>
<script type="text/javascript">
    const hansken = new HanskenClient('https://gatekeeper01.hansken.org/gatekeeper');

    hansken.projects().then((projects) => {
        projects.forEach((project) => {
            document.write(`<li>${project.name}`);
        });
    });
</script>
```
