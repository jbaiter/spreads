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
import classNames from "classnames";


export default React.createClass({
  displayName: "ResponsiveImage",
  propTypes: {
    /** React element to which the image should adopt.
     *  Can be passed a function for lazy-loading the element. */
    container: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
  },

  getInitialState() {
    return {
      style: {}
    };
  },

  componentDidMount() {
    // See `utils/DOMUtils/initCustomEvents`
    window.addEventListener("optimizedResize", this.onSizeChange);
  },

  componentWillUnmount() {
    // See `utils/DOMUtils/initCustomEvents`
    window.removeEventListener("optimizeResize", this.onSizeChange);
  },

  onSizeChange() {
    if (!this.isMounted()) {
      return;
    }
    const img = React.findDOMNode(this.refs.img);
    let container;
    if (React.isValidElement(this.props.container)) {
      container = React.findDOMNode(this.props.container);
    } else if (typeof this.props.container === "function") {
      container = React.findDOMNode(this.props.container());
    } else {
      container = img.parentElement;
    }
    const containerAspect = container.offsetWidth / container.offsetHeight;
    const imageAspect = img.naturalWidth / img.naturalHeight;

    let style = {};
    if (imageAspect > containerAspect) {
      style.width = container.offsetWidth;
    } else {
      style.height = container.offsetHeight;
    }
    this.setState({
      style, container
    });
  },

  render() {
    return (
      <img {...this.props} ref="img" style={this.state.style} onLoad={this.onSizeChange} />
    );
  }
});

