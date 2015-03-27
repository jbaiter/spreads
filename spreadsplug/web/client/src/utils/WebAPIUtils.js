var fetch = require('fetch');

function makeUrl() {
  return arguments.join('/');
}

function makeJsonRequest(url, method, data) {
  return fetch(url, {
    method: method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

module.exports = {
  makeUrl: makeUrl,
  makeJsonRequest: makeJsonRequest
};
