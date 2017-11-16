# corum-api
The API for Corum built using the Graphcool Framework.

Documentation for the graphcool framework is currently pretty sparse, find the official docs at https://www.graph.cool/docs/reference/

To find out more about how this API in particular works, visit the main [Corum repo](https://github.com/joealden/corum)

## Usage

### Deploying the API
To deploy the API (either locally or on a graphcool server), run the following commands:

```bash
npm install # This installs the dependencies for the custom auth resolvers
npm run deploy # Runs 'graphcool deploy'
```

### Accessing the Playground
As the name suggests, the playground lets one play around with the deployment. 
This command will only work if the API has been deployed.
To access the playground, run the following command:

```bash
npm run pg # Opens graphql-playground in the browser 
```