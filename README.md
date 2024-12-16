# UBC Course Explorer

This repository contains the frontend and backend implementations for our Course Explorer application, which takes datasets containing course and section information and produces visualizations and querying options.

- Frontend made using Next.js and Shadcn
- Backend made using Node.js and Express.js

<img width="966" alt="image" src="https://github.com/user-attachments/assets/d1501e36-7cf5-43f3-9e3e-f971d1a290ce" />


## Configuring your environment

1. In root, run CLI `yarn install`
2. Within frontend directory, run CLI `yarn install`
3. Start backend by going to root and running CLI `yarn start`
4. Start frontend by going to frontend directory and running CLI `yarn run dev`

## Project commands

Other CLI commands:

1. `yarn install` to download the packages specified in your project's _package.json_ to the _node_modules_ directory.

2. `yarn build` to compile your project. You must run this command after making changes to your TypeScript files. If it does not build locally, AutoTest will not be able to build it. This will also run formatting and linting, so make sure to fix those errors too!

3. `yarn test` to run the test suite.

   - To run with coverage, run `yarn cover`

4. `yarn prettier:fix` to format your project code.

5. `yarn lint:check` to see lint errors in your project code. You may be able to fix some of them using the `yarn lint:fix` command.

If you are curious, some of these commands are actually shortcuts defined in [package.json -> scripts](./package.json).
