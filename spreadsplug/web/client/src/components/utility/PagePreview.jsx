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

import ResponsiveImage from "components/utility/ResponsiveImage";
import {getImageUrl} from "utils/WebAPIUtils";


export default React.createClass({
  displayName: "PagePreview",
  propTypes: {
    page: PropTypes.object.isRequired,
    thumbnail: PropTypes.bool,
    fit: PropTypes.bool,
    full: PropTypes.bool,
    responsiveContainer: PropTypes.node,
    onClick: PropTypes.func
  },

  getDefaultProps() {
    return {
      fit: false,
      thumbnail: false,
      full: false
    };
  },

  getInitialState() {
    return {
      contentSize: null,
      containerSize: null
    };
  },

  /* eslint-disable */
  shouldComponentUpdate({page: nextPage, thumbnail: nextThumb, full: nextFull},
                        {contentSize: nextContentSize, containerSize: nextContainerSize}) {
    /* eslint-enable */
    const curPage = this.props.page;
    return (nextPage.capture_num !== curPage.capture_num) ||
           (nextPage.processing_params.rotate !== curPage.processing_params.rotate) ||
           (nextPage.processing_params.crop !== curPage.processing_params.crop) ||
           (nextThumb !== this.props.thumbnail) ||
           (nextFull !== this.props.full) ||
           (nextContentSize !== this.state.contentSize) ||
           (nextContainerSize !== this.state.containerSize);
  },

  handleSizeChanged() {
    const containerNode = React.findDOMNode(this.refs.container);
    const contentNode = React.findDOMNode(this.refs.content);
    this.setState({containerSize: {width: containerNode.offsetWidth,
                                height: containerNode.offsetHeight},
                  contentSize: {width: contentNode.offsetWidth,
                                height: contentNode.offsetHeight}});
  },

  getImageSrc() {
    return getImageUrl({page: this.props.page,
                        width: (this.props.full || this.props.thumbnail) ? null : 800,
                        thumbnail: this.props.thumbnail});
  },

  getCropBoxStyle() {
    let cropBoxStyle = {};
    if (this.props.page.processing_params.crop && this.state.contentSize) {
      let relValues = this.props.page.processing_params.crop;
      cropBoxStyle.left = relValues.x * this.state.contentSize.width;
      cropBoxStyle.top = relValues.y * this.state.contentSize.height;
      cropBoxStyle.width = relValues.width * this.state.contentSize.width;
      cropBoxStyle.height = relValues.height * this.state.contentSize.height;
    }
    return cropBoxStyle;
  },

  /** DANGER: Here be Dragons...
   *
   * These getStyles... methods are a complete and utter disaster.
   * A feeble attempt at bludgeoning the DOM into rendering a responsive
   * interface that works for thumbnails, scrollable lightboxes and fullscreen
   * while at the same time rotating the images...
   * Theres a lot of copypasta going on and the whole logic could probably
   * use a thorough review from somebody who is more well-versed in the DOM
   * than I am.
   */
  getStylesThumb() {
    const rotation = this.props.page.processing_params.rotate;
    let contentStyles = {
      width: "100%"
    };
    let containerStyles = {
      width: "100%"
    };
    if (rotation > 0) {
      contentStyles.transform = `rotate(${rotation}deg)`;
      // TODO: Make this fit the container width
      if (this.state.contentSize) {
        const {width, height} = this.state.contentSize;
        const smallDimension = Math.min(width, height);
        const largeDimension = Math.max(width, height);

        const offsetFactor = rotation === 90 ? 1 : -1;
        const offset = Math.floor(offsetFactor * (largeDimension - smallDimension) / 2);
        contentStyles.transform += ` translateX(${offset}px) translateY(${offset}px)`;

        containerStyles.width = rotation === 0 || rotation === 180 ? width : height;
        containerStyles.height = rotation === 0 || rotation === 180 ? height : width;
        contentStyles.width = rotation === 0 || rotation === 180 ? height : width;
        contentStyles.height = rotation === 0 || rotation === 180 ? width : height;
      }
    }

    return {contentStyles, containerStyles};
  },

  getStylesFit() {
    const rotation = this.props.page.processing_params.rotate;
    let contentStyles = {
      width: "100%"
    };
    let containerStyles = {
      width: "100%",
      height: "100%"
    };
    if (rotation > 0) {
      contentStyles.transform = `rotate(${rotation}deg)`;
      contentStyles.width = rotation === 0 || rotation === 180 ? "auto" : this.state.containerSize.height;
      contentStyles.height = rotation === 0 || rotation === 180 ? "100%" : "auto";
      const {width, height} = this.state.contentSize;
      const smallDimension = Math.min(width, height);
      const largeDimension = Math.max(width, height);

      const offsetFactor = rotation === 90 ? 1 : -1;
      const offset = Math.floor(offsetFactor * (largeDimension - smallDimension) / 2);
      contentStyles.transform += ` translateX(${offset}px) translateY(${offset}px)`;
      contentStyles.position = "absolute";
      contentStyles.left = `calc(50% - ${height / 2}px)`;
    }
    return {contentStyles, containerStyles};
  },

  getStylesDefault() {
    const rotation = this.props.page.processing_params.rotate;
    let contentStyles = {
      width: "100%"
    };
    let containerStyles = {
      width: "100%",
      height: "100%"
    };
    if (rotation > 0) {
      contentStyles.transform = `rotate(${rotation}deg)`;
      contentStyles.width = rotation === 0 || rotation === 180 ? "auto" : "100%";
      contentStyles.height = rotation === 0 || rotation === 180 ? "100%" : "auto";
    }
    return {contentStyles, containerStyles};
  },

  getStyles() {
    if (this.props.thumbnail) {
      return this.getStylesThumb();
    } else if (this.props.fit) {
      return this.getStylesFit();
    } else {
      return this.getStylesDefault();
    }
  },

  render() {
    let {contentStyles, containerStyles} = this.getStyles();
    const cropBoxStyle = this.getCropBoxStyle();

    return (
      //FIXME: In fullscreen, the image is not resized properly
      <div className="page-preview-container" style={containerStyles} ref="container">
        <div className="page-preview-content" style={contentStyles} ref="content">
          <a onClick={this.props.onClick}>
            <img src={this.getImageSrc({})} onLoad={this.handleSizeChanged}/>
            {cropBoxStyle.width &&
            <div className="page-preview-crop-overlay" style={cropBoxStyle} />}
          </a>
        </div>
      </div>
    );
  }
});


