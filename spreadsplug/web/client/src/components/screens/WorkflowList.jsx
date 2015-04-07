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
import {Input, Button, Table, Pager, PageItem} from "react-bootstrap";
import ListenerMixin from "alt/mixins/ListenerMixin";
import map from "lodash/collection/map";

import Icon from "components/utility/Icon.jsx";
import Media from "components/utility/Media.jsx";
import {getImageUrl} from "utils/WebAPIUtils";
import workflowStore from "stores/WorkflowStore";
import pageStore from "stores/PageStore";

const {PropTypes} = React;

const WorkflowItem = React.createClass({
  displayName: "WorkflowItem",
  propTypes: {
    workflow: PropTypes.object.isRequired,
    pages: PropTypes.object.isRequired
  },

  render() {
    const imageUrl = this.props.pages ?
      getImageUrl({workflowId: this.props.workflow.id,
                   captureNum: this.props.pages[0].capture_num,
                   thumbnail: true}) : null;
    return (
      <Media media={<img src={imageUrl} />}>
        <h3>{this.props.workflow.metadata.title}</h3>
      </Media>
    );
  }
});

export default React.createClass({
  displayName: "WorkflowList",
  mixins: [ListenerMixin],

  getInitialState() {
    return {
      workflows: workflowStore.getState().workflows,
      pages: pageStore.getState().pages
    };
  },

  componentDidMount() {
    this.listenToMany([workflowStore, pageStore], this.onChange);
  },

  onChange() {
    this.setState(this.getInitialState());
  },

  render() {
    const workflowItems = map(
      this.state.workflows,
      wf => <WorkflowItem key={wf.id} workflow={wf} pages={this.state.pages[wf.id]} />);
    return (
      <div>
        <h1>Workflows</h1>
        <div>{workflowItems}</div>
      </div>
    );
  }
})
