# Koast Admin API

## Setting up an admin API

### Create a koast module

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

### Get the Admin API router

You can obtain a router with discoverable routes by calling
`koast.admin.getRouter()` and passing in a configuration function.

```javascript
// TODO EXPORT KOAST.ADMIN
var koast = require('koast');
var routerPromise = koast.admin.getRouter(configurationFunction);
```

### The Configuration Function

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

}
```


## A more complete example

```javascript
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
  return adminApi.getS3BackupRouter('/s3', collections, mongoUri, aws);
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
```

#### Consuming this API

Assume that this koast module is mounted to `/admin/api`

```
POST /admin/api/discovery

// No data sent by client

// response:
{
  s3backup: {
    type: 'backup',
    paths: [
      { path: '/s3/:id', methods: { get: true } },
      { path: '/s3', methods: { post: true } }
    ]
  }
}
```



```
POST /admin/api
```
