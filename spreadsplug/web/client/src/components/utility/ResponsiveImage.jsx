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

import ResponsiveMixin from "components/utility/ResponsiveMixin";

export default React.createClass({
  displayName: "ResponsiveImage",
  mixins: [ResponsiveMixin],
  propTypes: {
    src: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
  },

  render() {
    let imageSrc;
    if (typeof this.props.src === "function") {
      imageSrc = this.props.src(this.state.size);
    } else {
      imageSrc = this.props.src;
    }
    return (
      <img {...this.props} src={imageSrc} ref="img" style={this.state.size}
           onLoad={this.onImageLoaded} />
    );
  }
});

