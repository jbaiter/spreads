import React from "react";
import {Route, DefaultRoute} from "react-router";

import App from "./components/App";
import LogDisplay from "./components/LogDisplay";
import WorkflowList from "./components/WorkflowList";
import WorkflowForm from "./components/WorkflowForm"

export default (
    <Route name="home" path="/" handler={App}>
        <DefaultRoute handler={WorkflowList} />
        <Route name="logging" path="/log" handler={LogDisplay} />
        <Route path="workflow">
          <DefaultRoute handler={WorkflowList} />
          <Route name="new-workflow" path="/new" handler={WorkflowForm} />
          <Route name="edit-workflow" path="/:id/edit" handler={WorkflowForm} />
        </Route>
    </Route>
);
