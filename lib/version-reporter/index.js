/** @module koast/versionReporter */
'use strict';

/**
 * Create a middleware to add koast version headers to the response
 * @return {function}
 */
module.exports = exports = function()
{
  return function(req,res,next)
  {
        res.header('X-Powered-By', 'Koast');
        res.header('X-Koast-Version',require('../../package.json').version);
        next();
  };
};
