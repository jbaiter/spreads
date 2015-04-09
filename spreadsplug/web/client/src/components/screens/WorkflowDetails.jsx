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

import React, {PropTypes} from "react";
import {Grid, Row, Col, ModalTrigger, ButtonGroup, Button} from "react-bootstrap";
import ListenerMixin from "alt/mixins/ListenerMixin";
import values from "lodash/object/values";

import workflowStore from "stores/WorkflowStore.js";
import pageStore from "stores/PageStore.js";
import {getImageUrl} from "utils/WebAPIUtils";
import Pagination from "components/utility/Pagination";
import Metadata from "components/utility/Metadata";
import Icon from "components/utility/Icon";
import LightboxModal from "components/modals/LightboxModal";

export default React.createClass({
  displayName: "WorkflowDetails",
  mixins: [ListenerMixin],
  propTypes: {
    params: PropTypes.object,
    query: PropTypes.object
  },

  componentDidMount() {
    this.listenTo(workflowStore, this.handleWorkflowChange);
    this.listenTo(pageStore, this.handlePageChange);
  },

  getInitialState() {
    return {
      workflow: workflowStore.getState().workflows[this.props.params.id],
      pages: pageStore.getState().pages[this.props.params.id],
      perPage: 24,
      pageOffset: 0,
      showInLightbox: undefined
    };
  },

  handleWorkflowChange() {
    this.setState({
      workflow: workflowStore.getState()[this.props.params.id]
    });
  },

  handlePageChange() {
    this.setState({
      pages: pageStore.getState()[this.props.params.id]
    });
  },

  handleGridBrowse(selected) {
    this.setState({
      pageOffset: Math.floor((selected - 1) * this.state.perPage)
    });
  },

  getPageNum() {
    return Math.floor(this.state.pageOffset / this.state.perPage) + 1;
  },

  getLightboxContent(pageId, isFullscreen) {
    // Adjust pagination
    const {pages, pageOffset, perPage} = this.state;
    if (Object.keys(pages).indexOf(pageId) > pageOffset + perPage) {
      this.setState({
        pageOffset: pageOffset + perPage
      });
    }

    const page = this.state.pages[pageId];
    let imageOpts = {
      workflowId: this.state.workflow.id,
      captureNum: page.capture_num
    };
    if (!isFullscreen) {
      imageOpts.width = 640;
    }
    const imageUrl = getImageUrl(imageOpts);

    return {
      title: `Page ${page.page_label}`,
      main: <img className="img-responsive" src={imageUrl} />,
      footer: (
        <ButtonGroup>
          <Button bsStyle="danger"><Icon name="trash-o" /> Delete</Button>
          <Button bsStyle="primary"><Icon name="crop" /> Crop</Button>
          <Button><Icon name="edit" /> Edit Metadata</Button>
        </ButtonGroup>)
    };
  },

  render() {
    const {pages, pageOffset, perPage} = this.state;
    const totalPages = Math.ceil(Object.keys(pages).length / perPage);
    return (
      <div>
        <h3>Metadata</h3>
        <Metadata metadata={this.state.workflow.metadata} />

        <h3>Pages</h3>
        <Grid>
          <Row>
            {values(pages).slice(pageOffset, pageOffset + perPage)
              .map((page) => {
                const previewUrl = getImageUrl({workflowId: this.state.workflow.id,
                                                captureNum: page.capture_num,
                                                thumbnail: true});
                return (
                  <Col xs={4} md={3} lg={2} key={page.capture_num}>
                    <a className="thumbnail"
                       onClick={() => this.setState({showInLightbox: page.capture_num})}>
                      <img src={previewUrl} className="img-responsive"/>
                    </a>
                  </Col>
                );
              })}
          </Row>
        </Grid>
        <Pagination pageNum={this.getPageNum()} totalPages={totalPages}
                    onPageChange={this.handleGridBrowse} />
        {this.state.showInLightbox !== undefined &&
          <LightboxModal contentIds={Object.keys(this.state.pages)}
                         onContentChange={this.getLightboxContent}
                         startId={this.state.showInLightbox.toString()}
                         onRequestHide={() => this.setState({showInLightbox: undefined})}/>}
      </div>
    );
  }
})
