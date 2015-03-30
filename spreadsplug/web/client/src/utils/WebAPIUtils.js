import "whatwg-fetch";
import map from "lodash/collection/map";

export function makeUrl(...parts) {
  return parts.join("/");
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
    return [key, val].map(encodeURIComponent).join("=");
  }).join("&");
  if (encoded) {
    return "?" + encoded;
  } else {
    return "";
  }
}

export function getImageUrl({workflowId, captureNum=0, imageType="raw",
                      thumbnail=false}) {
  let parts = ["/api", "workflow", workflowId, "page", captureNum,
               imageType];
  let params = {};
  if (thumbnail) {
    parts.push("thumb");
  } else {
    params.format = "browser";
  }
  return makeUrl(...parts) + makeParams(params);
}
