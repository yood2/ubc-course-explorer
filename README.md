# UBC Course Explorer - Full-stack Web Application for Managing Course Datasets!

This repository contains the frontend and backend implementations for our Course Explorer application, which takes datasets containing course and section information and produces visualizations and querying options.

- Frontend made using Next.js and Shadcn
- Backend made using Node.js and Express.js

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

### License

While the readings for this course are licensed using [CC-by-SA](https://creativecommons.org/licenses/by-sa/3.0/), **checkpoint descriptions and implementations are considered private materials**. Please do not post or share your project solutions. We go to considerable lengths to make the project an interesting and useful learning experience for this course. This is a great deal of work, and while future students may be tempted by your solutions, posting them does not do them any real favours. Please be considerate with these private materials and not pass them along to others, make your repos public, or post them to other sites online.
