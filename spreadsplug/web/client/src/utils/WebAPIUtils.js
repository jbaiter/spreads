import map from "lodash/collections/map";
import * as fetch from "fetch";

export function makeUrl() {
  return arguments.join("/");
}

export function makeJsonRequest(url, method, data) {
  return fetch(url, {
    method: method,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

export function makeParams(params) {
  const encoded = map(params, (val, key) => {
    [key, val].map(encodeURIComponent).join("=");
  }).join("&");
  if (encoded) {
    return "?" + encoded;
  } else {
    return "";
  }
}
