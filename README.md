# What is a Koast app?

Koast provides a base for a backend server to support an AngularJS app. (It may be useful for Javascript apps built with other frameworks as well, but our focus is on Angular.) The goal is to quickly setup a server that would take care of things that a typical AngularJS app would need (such as configuration, authentication, and database access) without resorting to code generation.

Koast consists of two parts:

A server side npm module "koast", which you can install with npm install koast. This module allows you to create a server. In a typical case, you would write a few lines of code to instantiate and start a server, defining most of the functionality through configuration files, a schema file, and a module implementing the API.

A client-side bower package "koast-angular", which you can install with bower install koast-angular. This provides an AngularJS module that helps your frontend app talk to the backend server. You don't have to use it: if you prefer you can just talk to the server directly. However, the frontend module might save you a bit of time.

# Koast quick start

To get koast up and running quickly, you will need to have a few basic files:

```
└── server
│   ├── lib
      └── api.js          -- koast API module using mongo mapper
    ├── app.js            -- server entry point
    └── schemas.js        -- mongo schemas
```

Koast has a high level of customization when it comes to loading confioguration files, but for a quick-start you can explicitly set your configuration within your app.js file.


```javascript
/* app.js */
var koast = require('koast');
var appSettings = {
  'app': {
    'indexHtml': 'path:../client/index.html',
    'portNumber': 8081,
    'routes': [{
      'route': '/api/v1',
      'type': 'module',
      'module': 'server/lib/api'
    }]
  },
  'databases': [{
    'host': '127.0.0.1',
    'port': '27017',
    'db': 'erg',
    'schemas': './server/schemas.js',
    'handle': '_'
  }]
};

koast.configure({
  appConfiguration: appSettings
});
koast.serve();
```

To quickly create api end-points with a MongoDB backend, an application can use the koast mongo-mapper. To use mongo-mapper, simply create a schema file like below:

```javascript
/* schemas .js */
exports.schemas = [{
  // Represents a task.
  name: 'tasks',
  properties: {
    taskId: Number,
    owner: String,
    description: String
  }
}];

```

and define a koast module to setup your routes:

```javascript
/* lib/api.js */
/* global require */

'use strict';

var koast = require('koast');
var koastRouter = koast.koastRouter;
var connection = koast.db.getConnectionNow();
var mapper = koast.mongoMapper.makeMapper(connection);

var defaults = {
  authorization: function (req, res) {
    return true;
  }
};

mapper.options.useEnvelope = false;

var routes = [{
  method: 'get',
  route: 'tasks',
  handler: mapper.get({
    model: 'tasks'
  })
}, {
  method: ['get', 'put', 'post', 'delete'],
  route: 'tasks/:_id',
  handler: mapper.auto({
    model: 'tasks'
  })
}];

module.exports = exports = {
  koastModule: {
    defaults: defaults,
    router: koastRouter(routes, defaults)
  }
};

```

When running this application with node server/app.js, you will have a quick CRUD application setup for your tasks schema.

# Further Reading ...

More in depth documentation is available [under the docs folder](./docs/readme.md). This documentation goes into more details about how to configure koast, the features supported and the other modules that are available.

- [Basics](./docs/readme.md#basics)
  - [Getting Started](./docs/readme.md#getting-started)
- [Configuration](./docs/readme.md#configuration)
- [Setting up Routes](./docs/readme.md#setting-up-routes)
  - [Static Routes](./docs/readme.md#static)
  - [Module Routes](./docs/readme.md#module)
  - [Migrating older Koast Routes](./docs/readme.md#migrating-older-koast-applications)
- [Mongo Mapper](./docs/readme.md#mongo-mapper)
  - [Basic Usage](./docs/readme.md#basic-usage)
  - [Mongo Mapper Options](./docs/readme.md#mongo-mapper-options)
  - [Annotators](./docs/readme.md#annotators)
  - [Query Decorators](./docs/readme.md#query-decorators)
  - [Filters](./docs/readme.md#filters)
