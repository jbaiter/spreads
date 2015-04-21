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
 * You should have received a copy of thghte GNU Affero General Public License
 * along with Spreads.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, {PropTypes} from "react";

export default {
  propTypes: {
    /** React element to which the component should adapt.
     *  Can be passed a function for lazy-loading the element.
     *  Alternatively, make sure there is a `container` ref. */
    container: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    /** Callback for when the size is changed. Gets passed a {width, height}
     *  object. */
    onSizeChanged: PropTypes.func
  },

  getInitialState() {
    return {
      imageSize: null,
      size: {}
    };
  },

  componentDidMount() {
    // See `utils/DOMUtils/initCustomEvents`
    window.addEventListener("optimizedResize", this.onSizeChange);
  },

  componentWillUnmount() {
    // See `utils/DOMUtils/initCustomEvents`
    window.removeEventListener("optimizedResize", this.onSizeChange);
  },

  onImageLoaded(e) {
    this.setState({
      imageSize: {
        width: e.target.naturalWidth,
        height: e.target.naturalHeight
      }
    }, this.onSizeChange);
  },

  onSizeChange() {
    if (!this.isMounted()) {
      return;
    }
    if (!this.state.imageSize) {
      return;
    }
    const {width: imgWidth, height: imgHeight} = this.state.imageSize;
    let container;
    if (React.isValidElement(this.props.container)) {
      container = React.findDOMNode(this.props.container);
    } else if (typeof this.props.container === "function") {
      container = React.findDOMNode(this.props.container());
    } else {
      container = React.findDOMNode(this.refs.container);
    }
    const onSizeChanged = this.props.onSizeChanged || this.onSizeChanged;
    if (!container) {
      if (onSizeChanged) {
        onSizeChanged(this.state.imageSize);
      }
      return;
    }
    const containerAspect = container.offsetWidth / container.offsetHeight;
    const imageAspect = imgWidth / imgHeight;

    let size = {
      innerAspect: imageAspect
    };
    if (imageAspect > containerAspect) {
      size.width = container.offsetWidth;
      size.height = Math.floor(size.width / imageAspect);
    } else {
      size.height = container.offsetHeight;
      size.width = Math.floor(size.height * imageAspect);
    }
    this.setState({
      size
    });
    if (onSizeChanged) {
      onSizeChanged(this.state.size);
    }
  }
}
