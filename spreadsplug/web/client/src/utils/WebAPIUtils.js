/*
 * Spreads - Modular workflow assistant for book digitization
 * Copyright (C) 2013-2015 Johannes Baiter <johannes.baiter@gmail.com>
 *
 * This file is part of Spreads.
 *
 * Spreads is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Spreads is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Spreads.  If not, see <http://www.gnu.org/licenses/>.
 */

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

export function getImageUrl({page, imageType="raw", thumbnail=false, width=null}) {
  let baseUrl;
  if (imageType === "raw") {
    baseUrl = page.raw_image.url;
  } else {
    baseUrl = page.processed_images[imageType].url;
  }
  let params = {};
  if (thumbnail) {
    baseUrl += "/thumb";
  } else {
    baseUrl += "/data";
    if (width) {
      params.width = width;
    } else {
      params.format = "browser";
    }
  }
  return baseUrl + makeParams(params);
}

export function fetchChecked(url, options={}) {
  return fetch(url, options)
    .then((resp) => {
      if (resp.status >= 200 && resp.status < 300) {
        return Promise.resolve(resp);
      } else {
        return Promise.reject(new Error(resp.statusText));
      }
    });
}

export function fetchJson(url, options) {
  Object.assign(options.headers, {
      "Accept": "application/json",
      "Content-Type": "application/json"});
  if (options.body && typeof options.body !== "string") {
    options.body = JSON.stringify(options.body);
  }
  return fetch(url, options)
    .then((resp) => {
      const json = resp.json();
      if (resp.status >= 200 && resp.status < 300) {
        return Promise.resolve(json);
      } else {
        return json.then((data) => Promise.reject(data));
      }
    });
}
