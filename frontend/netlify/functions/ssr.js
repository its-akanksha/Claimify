const server = require('../../dist/server/main.server.mjs');

exports.handler = (event, context) => {
  return new Promise((resolve, reject) => {
    server.app(event, context, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};
