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
import map from "lodash/collection/map";
import Icon from "components/utility/Icon.jsx";

const {PropTypes} = React;

export default React.createClass({
  displayName: "ProposalModal",
  propTypes: {
    proposedData: PropTypes.object,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func
  },

  render() {
    return (
      <Modal {...this.props} bsStyle="primary" title="Automaticall fill metadata?"
             onRequestHide={this.props.onCancel}>
        <div className="modal-body">
          <p>
            We have found a match for the ISBN you entered.
            Do you want to automically fill in the other fields?
          </p>
          <dl>
          {[].concat(...map(this.props.proposedData, (value, key) => [
            <dt key={"term-" + key}>{key}</dt>,
            <dd key={"def-" + key}>{value}</dd>
          ]))}
          </dl>
        </div>
        <div className="modal-footer">
          <Button bsStyle="primary" onClick={this.props.onConfirm}>
            <Icon name="tick" /> Confirm
          </Button>
          <Button bsStyle="default" onClick={this.props.onCancel}>
            <Icon name="cross" /> Cancel
          </Button>
        </div>
      </Modal>
    );
  }
});
