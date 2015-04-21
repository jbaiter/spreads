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
    responsiveContainer: PropTypes.node,
    onClick: PropTypes.func
  },

  getDefaultProps() {
    return {
      thumbnail: false
    };
  },

  getInitialState() {
    return {
      imgSize: null
    };
  },

  /* eslint-disable */
  shouldComponentUpdate({page: nextPage, thumbnail: nextThumb}, {imgSize: nextImgSize}) {
    /* eslint-enable */
    const curPage = this.props.page;
    return (nextPage.capture_num !== curPage.capture_num) ||
           (nextPage.processing_params.rotate !== curPage.processing_params.rotate) ||
           (nextPage.processing_params.crop !== curPage.processing_params.crop) ||
           (nextThumb !== this.props.thumbnail) ||
           (nextImgSize !== this.state.imgSize);
  },

  handleSizeChanged({width, height}) {
    this.setState({imgSize: {width, height}});
  },

  getImageSrc({full=false, width}) {
    return getImageUrl({page: this.props.page,
                        width: (full || this.props.thumbnail) ? null : width || 640,
                        thumbnail: this.props.thumbnail});
  },

  render() {
    const rotation = this.props.page.processing_params.rotate;
    let contentStyles = {};
    let containerStyles = {};
    let cropBoxStyle = {};
    if (this.props.page.processing_params.crop && this.state.imgSize) {
      let relValues = this.props.page.processing_params.crop;
      cropBoxStyle.left = relValues.x * this.state.imgSize.width;
      cropBoxStyle.top = relValues.y * this.state.imgSize.height;
      cropBoxStyle.width = relValues.width * this.state.imgSize.width;
      cropBoxStyle.height = relValues.height * this.state.imgSize.height;
    }

    if (rotation > 0) {
      contentStyles.transform = `rotate(${rotation}deg)`;
      if (this.state.imgSize) {
        const {width, height} = this.state.imgSize;
        const smallDimension = Math.min(width, height);
        const largeDimension = Math.max(width, height);

        const offsetFactor = rotation === 90 ? 1 : -1;
        const offset = Math.floor(offsetFactor * (largeDimension - smallDimension) / 2);
        contentStyles.transform += ` translateX(${offset}px)`;

        containerStyles.width = largeDimension;
        containerStyles.height = largeDimension;
      }
    }
    return (
      //FIXME: In fullscreen, the image is not resized properly
      <div className="page-preview-container" style={containerStyles}>
        <div className="page-preview-content" style={contentStyles}>
          <a onClick={this.props.onClick}>
            <ResponsiveImage src={this.getImageSrc} onSizeChanged={this.handleSizeChanged}
                             container={this.props.responsiveContainer} />
            {cropBoxStyle.width &&
            <div className="page-preview-crop-overlay" style={cropBoxStyle} />}
          </a>
        </div>
      </div>
    );
  }
});


