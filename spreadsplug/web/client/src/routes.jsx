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

import React from "react";
import {Route, DefaultRoute} from "react-router";

import App from "components/App";
import Preferences from "components/screens/Preferences";
import LogDisplay from "components/screens/LogDisplay";
import WorkflowList from "components/screens/WorkflowList";
import WorkflowForm from "components/screens/WorkflowForm"

export default (
    <Route name="home" path="/" handler={App}>
        <DefaultRoute handler={WorkflowList} />
        <Route name="logging" path="/log" handler={LogDisplay} />
        <Route name="preferences" path="/preferences" handler={Preferences} />
        <Route path="workflow">
          <DefaultRoute handler={WorkflowList} />
          <Route name="new-workflow" path="/new" handler={WorkflowForm} />
          <Route name="edit-workflow" path="/:id/edit" handler={WorkflowForm} />
        </Route>
    </Route>
);
