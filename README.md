# corum-api
The API for Corum built using the Graphcool Framework.

Documentation for the graphcool framework is currently pretty sparse, find the official docs at https://www.graph.cool/docs/reference/

## Usage

**WARNING:** This is a WIP, and might possibly on work when authenticated with my graphcool account. _(For example, the included `.graphcoolrc` contains the ID of my deployment)_

### Deploying the API
To deploy the API (either locally or on a graphcool server), run the following commands:

```
npm install
npm run deploy
```

### Accessing the Playground
As the name suggests, the playground lets one play around with the deployment. 
This command will only work if the API has been deployed.
To access the playground, run the following command:

```
npm run pg
```