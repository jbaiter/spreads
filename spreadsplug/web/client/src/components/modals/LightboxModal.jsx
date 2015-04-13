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

import React, {PropTypes, cloneElement} from "react";
import {Modal, ButtonGroup, Button} from "react-bootstrap";
import FullscreenMixin from "react-fullscreen-component";

import Icon from "components/utility/Icon";
import ResponsiveImage from "components/utility/ResponsiveImage";
import CropWidget from "components/utility/CropWidget";
import {getImageUrl, fetchJson} from "utils/WebAPIUtils";

export default React.createClass({
  displayName: "LightboxModal",
  mixins: [FullscreenMixin],
  propTypes: {
    /** Pages that should be available through the lightbox */
    pages: PropTypes.array.isRequired,
    startPage: PropTypes.object,
    wrap: PropTypes.bool,
    enableCrop: PropTypes.bool,
    onCropped: PropTypes.func,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func
  },

  getDefaultProps() {
    return {
      wrap: true,
      enableCrop: false
    };
  },

  getInitialState() {
    return {
      viewCropWidget: false,
      currentPage: this.props.startPage || this.props.pages[0],
      imageNativeSize: null
    };
  },

  toggleFullscreen() {
    if (this.state.isFullscreen) {
      if (this.state.viewCropWidget) {
        this.setState({viewCropWidget: false});
      }
      this.exitFullscreen();
    } else {
      this.requestFullscreen(this.refs.container);
    }
  },

  handlePreviousClick() {
    const currentIdx = this.props.pages.indexOf(this.state.currentPage);
    let previousPage;
    if (currentIdx === 0) {
      previousPage = this.props.pages.slice(-1)[0];
    } else {
      previousPage = this.props.pages[currentIdx - 1];
    }
    this.setState({currentPage: previousPage});
  },

  handleNextClick() {
    const currentIdx = this.props.pages.indexOf(this.state.currentPage);
    let nextPage;
    if (currentIdx === this.props.pages.length - 1) {
      nextPage = this.props.pages[0];
    } else {
      nextPage = this.props.pages[currentIdx + 1];
    }
    this.setState({currentPage: nextPage});
  },

  onToggleCrop() {
    if (!this.state.isFullscreen) {
      this.toggleFullscreen();
    }
    this.setState({
      viewCropWidget: !this.state.viewCropWidget
    });
  },

  getImageSrc({full=false, width}) {
    return getImageUrl({page: this.state.currentPage,
                        width: full ? null : width || 640});
  },

  retrieveNativeSize(page) {
    let imgUrl = getImageUrl({page: page}).split("?")[0];
    fetchJson(imgUrl.substring(0, imgUrl.length - 5) + "/size")
      .then((data) => this.setState({imageNativeSize: data}));
  },

  getMainContent() {
    if (this.state.viewCropWidget) {
      // We lazy-load the native size to ensure that the crop dialog pops up
      // quickly. This will cause an additional re-render once the size has
      // been obtained.
      if (!this.state.imageNativeSize) {
        this.retrieveNativeSize(this.state.currentPage);
      }
      return (<CropWidget imageSrc={this.getImageSrc} onSave={this.props.onCropped}
                          nativeSize={this.state.imageNativeSize}
                          container={() => this.refs.container} />);
    } else {
      return (<ResponsiveImage src={this.getImageSrc}
                               container={() => this.refs.container} />);
    }
  },

  getFooterContent() {
    return (
      <ButtonGroup>
        {this.props.onDelete &&
          <Button bsStyle="danger" onClick={this.props.onDelete}>
            <Icon name="trash-o" /> Delete
          </Button>}
        {this.props.onCropped &&
          <Button bsStyle="primary" onClick={this.onToggleCrop}>
            <Icon name="crop" /> Crop
          </Button>}
        {this.props.onEdit &&
          <Button onClick={this.props.onEdit}>
            <Icon name="edit" /> Edit Metadata
          </Button>}
        <Button href={this.getImageSrc({full: true})} target="_blank">
          <Icon name="image" /> Full image
        </Button>
      </ButtonGroup>);
  },

  render() {
    const {wrap: doWrap} = this.state;
    const currentIdx = this.props.pages.indexOf(this.state.currentPage);
    const viewPrevious = currentIdx > 0 || doWrap;
    const viewNext = currentIdx < (this.props.pages.length - 1) || doWrap;
    const title = this.state.currentPage.page_label;

    return (
      <Modal {...this.props} animation={true} title={title} className="lightbox">
        <div className="modal-body">
          <div className="lightbox-container" ref="container">
            <div className="lightbox-content">
              <a className="toggle-fullscreen" onClick={this.toggleFullscreen}>
                <Icon name={this.state.isFullscreen ? "close" : "expand"} />
              </a>
              {this.getMainContent()}
              {!this.state.viewCropWidget &&
              <div className="lightbox-nav-overlay" ref="navOverlay">
                <a className="lightbox-nav-left"
                    onClick={viewPrevious && this.handlePreviousClick}>
                  {viewPrevious && <Icon name="chevron-left" />}
                </a>
                <a className="lightbox-nav-right"
                    onClick={viewNext && this.handleNextClick}>
                  {viewNext && <Icon name="chevron-right" />}
                </a>
              </div>}
              {this.state.isFullscreen && !this.state.viewCropWidget &&
               <div className="fullscreen-footer">{this.getFooterContent()}</div>}
            </div>
          </div>
        </div>
        <div className="modal-footer">{this.getFooterContent()}</div>
      </Modal>
    );
  }
});
