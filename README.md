# NoHeadacheNode

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

If this is a brand new project, make sure to create a `package.json` first with
the [`npm init` command](https://docs.npmjs.com/creating-a-package-json-file).

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```console
$ npm install noheadachenode
```

# Features

Automatic Request Parsing - No manual JSON.parse() or URL parsing
Flexible Response Methods - Multiple ways to send responses
Middleware Support - Add cross-cutting concerns (auth, logging, CORS)
Dynamic Routing - URL parameters extracted automatically
Error Handling - Graceful error responses, no server crashes
File Streaming - Efficient file serving without memory issues
Chainable APIs - Clean, readable code with method chaining

Convention over Configuration - File structure defines routes
Automatic Discovery - No manual route registration needed
Hot Reloading - Changes picked up in development
Nested Structure - Organize complex APIs logically
Multiple HTTP Methods - One file can handle GET, POST, PUT, DELETE
Error Isolation - Bad route files don't crash the server
Clear Mapping - Easy to find route handler for any URL

Cors Error auto handling
