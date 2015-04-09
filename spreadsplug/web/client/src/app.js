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

/**
 * @file Entrypoint for the application, sets up the Flux components and
 *       initiates the router.
 */
import React from "react";
import ReactRouter from "react-router";
import fetch from "whatwg-fetch";

import routes from "routes";
import alt from "alt";

// We need to import all alt-related modules to register them with our
// dispatcher
import WorkflowActions from "actions/WorkflowActions";
import PageActions from "actions/PageActions";
import CaptureActions from "actions/CaptureActions";
import SystemActions from "actions/SystemActions";
import LoggingActions from "actions/LoggingActions";

import WorkflowStore from "stores/WorkflowStore";
import LoggingStore from "stores/LoggingStore";
import PageStore from "stores/PageStore";
import AppStateStore from "stores/AppStateStore";

import ServerEventListener from "utils/ServerEventListener.js";
import {initCustomEvents} from "utils/DOMUtils.js";

require("../scss/app.scss");

initCustomEvents();
alt.bootstrap(JSON.stringify(window.bootstrapData));

const eventListener = new ServerEventListener();
eventListener.connect();

if (__DEV__) {
  alt.dispatcher.register(console.log.bind(console));
}

// When the client visits a route that the server does not know about, it
// redirects from '/some/route' to '#/some/route' to indicate that the route
// should be resolved client-side. We parse that route and push it to the
// history stack, which will lead react-router to render the correct view.
const pathRegex = /.*\/#(.*)/;
if (pathRegex.test(window.location.href)) {
  const path = "/" + pathRegex.exec(window.location.href)[1];
  window.history.replaceState({path: path}, "", path);
}

ReactRouter.run(routes, ReactRouter.HistoryLocation,
                (Handler, {params, query}) => React.render(
                  <Handler params={params} query={query}/>,
                  document.body));
