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
import map from "lodash/collection/map";

const {PropTypes} = React;

export default React.createClass({
  displayName: "Metadata",
  propTypes: {
    metadata: PropTypes.object.isRequired
  },

  render() {
    let definitions = [].concat(...map(this.props.metadata, (value, key) => {
      let elems = [
        <dt className="text-capitalize" key={["term", key].join("-")}>
          {key}
        </dt>
      ];
      if (Array.isArray(value)) {
        let lis = [];
        for (let [idx, val] of value.entries()) {
          lis.push(<li key={["def", key, idx].join("-")}>{val}</li>);
        }
        elems.push(
          <dd key={["def", key].join("-")}>
            <ul className="list-unstyled">{lis}</ul>
          </dd>);
      } else {
        elems.push(
          <dd key={["def", key].join("-")}>
            {value}
          </dd>);
      }
      return elems;
    }));

    return (
      <dl className="dl-horizontal">
        {definitions}
      </dl>
    );
  }
});
