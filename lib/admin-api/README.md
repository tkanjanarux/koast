# Koast Admin API

So you want an admin API, huh kid?


## Setting up an admin API

The koast admin API is a series of utility functions that one can
use to generate an HTTP API for controlling certain functionality
in a Koast application.


#### Create a koast module

Our admin API is just another koast module. You just have to obtain
a router with a `GET /discovery` route for the admin clients.

```javascript
exports = module.exports = {
  defaults: {
    authorization: function(req,res) {
      return true;
    }
  },

  router: router
};
```

#### Get the Admin API router

You can obtain a router with discoverable routes by calling
`koast.admin.getRouter()` and passing in a configuration function.

```javascript
// TODO EXPORT KOAST.ADMIN
var koast = require('koast');
var routerPromise = koast.admin.getRouter(configurationFunction);
```

#### The Configuration Function

The configuration function takes one paramater, `register`, and
**must** return a promise that resolves upon completion.


_TODO ensure that app-maker.js waits for promise_


This is where the magic happens. The reasoning behind having the
configuration file, is so that you can **register** handlers to be
discoverable by the client.

Here is an example of a configuration function:

```javascript
var express = require('express');

var configurationFunction = function(register) {

  //
  // routers typically obtained from convenience functions
  //
  var router = express.Router();
  router.get('/:id', function() {});
  router.post('/', function() {});

  register({
    router: router,
    type: 'backup',
    name: 's3backup',
    mount: '/apimodule'
  });

  var d = q.defer();
  d.resolve();
  return d.promise;
};
```

#### Registration function

This is how you register a function to be **discoverable**.
Your admin API router should contain a `GET /discovery` endpoint.

The registration function takes a single configuration object as a
parameter. The object must contain the following properties:

```
{
  router: r, // The routes!

  type:   t, // Admin API module type
             // Could be one of:
             // - backup
             // - restore
             // - TODO
             // - THINK OF MORE API MODULE IDEAS

  name: n,   // Display name

  mount: m,  // Base path
             // defaults to '/'

}
```


### `GET /discovery`

Making a GET request to this URL should yield a map of named modules
to their respective metadata.


The metadata will include the type of API module associated with that name.
**THIS IS HOW YOU WILL DIFFERENTIATE BETWEEN UIs IN THE ADMIN APP**
It will also contain an array of paths and methods.


Example:

```
moduleName: {
  type: 'moduleType'
  paths: [{
    path: '/path',
    methods: {put: true, post: true}
  }, ...]
}
```


# A more complete example

## Setup koast module

```javascript
var koast = require('koast');

// Ideally these should come from a config file
var access = process.env.AWS_ACCESS;
var secret = process.env.AWS_SECRET;
var bucket = process.env.AWS_S3_BUCKET;

function setupS3() {
  //
  // Configure an S3 backup router
  //
  var collections = ['collections', 'go', 'here'];
  var mongoUri = 'mongodb://localhost:27017/dumptestdb';
  var aws = {
    global: {
      accessKeyId: access,
      secretAccessKey: secret
    },

    s3: { bucket: bucket }
  }

  // Get the s3 router
  // TODO FIX THIS EXAMPLE
  // FIXME EXPORT getS3BackupRouter
  return koast.admin.getS3BackupRouter('/s3', collections, mongoUri, aws);
}


function configureApi(register) {

  var s3router = setupS3();
  register({
    router: s3router,
    type: 'backup',
    name: 'S3 Backup',
    mount: '/backup'
  });


  // make a promise and resolve it.
  var deferred = q.defer();
  deferred.resolve();
  return deferred.promise;
}


var routerPromise = koast.admin.getRouter(configureApi);

exports = module.exports = {
  defaults: {
    authorization: function(req,res) {
      return true;
    }
  },

  router: routerPromise
};
```

## Consuming this API

Assume that this koast module is mounted to `/admin/api`

```
GET /admin/api/discovery

// response:
{
  s3backup: {
    type: 'backup',
    paths: [
      { path: '/backup/s3/:id', methods: { get: true } },
      { path: '/backup/s3', methods: { post: true } }
    ]
  }
}
```

We know that we have a backup module with these routes available:

```
GET  /admin/api/backup/s3/:id
POST /admin/api/backup/s3/:id
```

**TODO explain different module types? The following instructions are
specific to type `backup`**

```
POST /admin/api/backup/s3

// No data sent from client

// response:
{
  finished: false,
  id: 'a3954ef0-79aa-11e4-b129-4b5fcf1201a6',
  start: 1417473452383
}
```

When the backup is done, the response will look like this instead:
  
```
GET /admin/api/backup/s3/a3954ef0-79aa-11e4-b129-4b5fcf1201a6

// No data sent from client

// response:
{
  id: 'a3954ef0-79aa-11e4-b129-4b5fcf1201a6',
  finished: true,
  success: true, 
  url: [ //only present when success is true
    'url',
    'for',
    'each',
    'collection' //this can change
  ],
  start: 1417473452383,
  end: 1417480000000,
}
```



