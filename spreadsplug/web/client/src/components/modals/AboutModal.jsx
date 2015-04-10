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
import {Modal, Button} from "react-bootstrap";
import LOGO_URL from "../../../../../../doc/_static/logo.png";

const {PropTypes} = React;

export default React.createClass({
  displayName: "AboutModal",
  propTypes: {
    version: PropTypes.string.isRequired
  },

  render() {
    const contribUrl = "https://github.com/DIYBookScanner/spreads/graphs/contributors",
          mailUrl = "mailto:johannes.baiter@gmail.com",
          licenseUrl = "https://github.com/DIYBookScanner/spreads/blob/master/LICENSE.txt";

    return (
      <Modal {...this.props} bsStyle="primary" title="About Spreads" animation={true}>
        <div className="modal-body">
          <img src={LOGO_URL} className="about-logo img-responsive" />
          <hr/>
          <p>Version {this.props.version}</p>
          <p>
            Licensed under the terms of the <a href={licenseUrl}>
            GNU Affero General Public License 3.0</a>.
          </p>
          <p>
            &copy; 2013-2014 Johannes Baiter<a href={mailUrl}>&lt;johannes.baiter@gmail.com&gt;</a>
          </p>
          <p>
            For a full list of contributors, please consult <a href={contribUrl}>GitHub</a>
          </p>
        </div>
      </Modal>
    );
  }
});
