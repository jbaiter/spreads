import React from "react";
import ReactRouter from "react-router";
import fetch from "whatwg-fetch";

import routes from "./routes";
import alt from "./alt";

import WorkflowActions from "./actions/WorkflowActions";
import PageActions from "./actions/PageActions";
import CaptureActions from "./actions/CaptureActions";
import SystemActions from "./actions/SystemActions";
import LoggingActions from "./actions/LoggingActions";

import WorkflowStore from "./stores/WorkflowStore";
import LoggingStore from "./stores/LoggingStore";
import PageStore from "./stores/PageStore";
import AppStateStore from "./stores/AppStateStore";

import ServerEventListener from "./utils/ServerEventListener.js";

require("../scss/app.scss");

alt.bootstrap(JSON.stringify(window.bootstrapData));

const eventListener = new ServerEventListener();
eventListener.connect();

if (__DEV__) {
  alt.dispatcher.register(console.log.bind(console));
}

const pathRegex = /.*\/#(.*)/;
if (pathRegex.test(window.location.href)) {
  const path = "/" + pathRegex.exec(window.location.href)[1];
  window.history.replaceState({path: path}, "", path);
}

ReactRouter.run(routes, ReactRouter.HistoryLocation,
                (Handler, {params, query}) => React.render(
                  <Handler params={params} query={query}/>,
                  document.body));
