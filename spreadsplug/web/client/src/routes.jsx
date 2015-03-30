import React from "react";
import {Route, DefaultRoute} from "react-router";

import App from "./components/App";
import LogDisplay from "./components/LogDisplay";
import WorkflowList from "./components/WorkflowList";

export default (
    <Route name="home" path="/" handler={App}>
        <DefaultRoute handler={WorkflowList} />
        <Route name="logging" path="/log" handler={LogDisplay} />
    </Route>
);
