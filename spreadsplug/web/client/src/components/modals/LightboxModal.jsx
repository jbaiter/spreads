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
import {Modal, Button} from "react-bootstrap";
import FullscreenMixin from "react-fullscreen-component";

import Icon from "components/utility/Icon";
import ResponsiveImage from "components/utility/ResponsiveImage";

export default React.createClass({
  displayName: "LightboxModal",
  mixins: [FullscreenMixin],
  propTypes: {
    /** Identifiers for the content, will get passed to `onContentChange` */
    contentIds: PropTypes.array.isRequired,
    /** Callback to obtain content objects, gets passed a `contentId` and
     * whether we are in fullscreen mode or not.
     * Must return an object with `title`, `main` and `footer`, where only
     * `main` is required. */
    onContentChange: PropTypes.func.isRequired,
    startId: PropTypes.any,
    wrap: PropTypes.bool
  },

  getDefaultProps() {
    return {
      wrap: true
    };
  },

  getInitialState() {
    const idx = this.props.startId ?
      this.props.contentIds.indexOf(this.props.startId) : 0;
    const content = this.convertContent(this.props.onContentChange(this.props.startId, false));
    return {
      currentContentIdx: idx, content
    };
  },

  convertContent(content) {
    if (content.main.type === "img") {
      content.main = (<ResponsiveImage container={() => this.refs.container}
                                       {...content.main.props} />);
    }
    return content;
  },

  toggleFullscreen(e) {
    e.preventDefault();
    if (this.state.isFullscreen) {
      this.exitFullscreen();
    } else {
      this.requestFullscreen(this.refs.container);
    }
  },

  handlePreviousClick() {
    let previousIdx;
    if (this.state.currentContentIdx === 0) {
      previousIdx = this.props.contentIds.length - 1;
    } else {
      previousIdx = this.state.currentContentIdx - 1;
    }
    const id = this.props.contentIds[previousIdx];
    const content = this.convertContent(this.props.onContentChange(id, this.state.isFullscreen));
    this.setState({currentContentIdx: previousIdx, content});
  },

  handleNextClick() {
    let nextIdx;
    if (this.state.currentContentIdx === this.props.contentIds.length - 1) {
      nextIdx = 0;
    } else {
      nextIdx = this.state.currentContentIdx + 1;
    }
    const id = this.props.contentIds[nextIdx];
    const content = this.convertContent(this.props.onContentChange(id, this.state.isFullscreen));
    this.setState({currentContentIdx: nextIdx, content});
  },

  onEnterFullscreen() {
    const id = this.props.contentIds[this.state.currentContentIdx];
    const content = this.convertContent(this.props.onContentChange(id, true));
    this.setState({content});
  },

  onExitFullscreen() {
    const id = this.props.contentIds[this.state.currentContentIdx];
    const content = this.convertContent(this.props.onContentChange(id, false));
    this.setState({content});
  },

  render() {
    const {currentContentIdx: idx, wrap: doWrap} = this.state;
    const {title, main, footer} = this.state.content;
    const viewPrevious = idx > 0 || doWrap;
    const viewNext = idx < (this.props.contentIds.length - 1) || doWrap;
    return (
      <Modal {...this.props} animation={true} title={title} className="lightbox">
        <div className="modal-body">
          <div className="lightbox-container" ref="container">
            <div className="lightbox-content">
              <a className="toggle-fullscreen" onClick={this.toggleFullscreen}>
                <Icon name={this.state.isFullscreen ? "close" : "expand"} />
              </a>
              {main}
              <div className="lightbox-nav-overlay" ref="navOverlay">
                <a className="lightbox-nav-left"
                    onClick={viewPrevious && this.handlePreviousClick}>
                  {viewPrevious && <Icon name="chevron-left" />}
                </a>
                <a className="lightbox-nav-right"
                    onClick={viewNext && this.handleNextClick}>
                  {viewNext && <Icon name="chevron-right" />}
                </a>
              </div>
              {this.state.isFullscreen &&
               <div className="fullscreen-footer">{footer}</div>}
            </div>
          </div>
        </div>
        <div className="modal-footer">{footer}</div>
      </Modal>
    );
  }
});

