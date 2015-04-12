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
import {Link} from "react-router";
import {Input, Button, Table, Pager, PageItem} from "react-bootstrap";
import ListenerMixin from "alt/mixins/ListenerMixin";
import map from "lodash/collection/map";
import values from "lodash/object/values";

import Icon from "components/utility/Icon.jsx";
import Media from "components/utility/Media.jsx";
import Pagination from "components/utility/Pagination";
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
      getImageUrl({page: this.props.pages[0],
                   thumbnail: true}) : null;
    const mediaElem = (
      <Link to="view-workflow" params={{id: this.props.workflow.id}}>
        <img src={imageUrl} />
      </Link>);
    return (
      <Media media={mediaElem}>
        <h3>
          <Link to="view-workflow" params={{id: this.props.workflow.id}}>
            {this.props.workflow.metadata.title}
          </Link>
        </h3>
        <ul>
          <li><Icon name="file-o"/> {Object.keys(this.props.pages).length}</li>
        </ul>
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
      pages: pageStore.getState().pages,
      perPage: 5,
      offset: 0
    };
  },

  componentDidMount() {
    this.listenToMany([workflowStore, pageStore], this.onChange);
  },

  onChange() {
    this.setState(this.getInitialState());
  },

  handlePageChange(pageNum) {
    this.setState({
      offset: Math.floor((pageNum - 1) * this.state.perPage)
    });
  },

  render() {
    const {offset, perPage, workflows} = this.state;
    const totalPages = Math.ceil(Object.keys(workflows).length / perPage);
    const currentPage = Math.floor(offset / perPage) + 1;
    const workflowItems = values(workflows).slice(offset, offset + perPage).map(
      wf => <WorkflowItem key={wf.id} workflow={wf} pages={this.state.pages[wf.id]} />);
    return (
      <div>
        <h1>Workflows</h1>
        <div>{workflowItems}</div>
        {totalPages > 1 &&
        <Pagination pageNum={currentPage} totalPages={totalPages}
                    onPageChange={this.handlePageChange} />}
      </div>
    );
  }
})
