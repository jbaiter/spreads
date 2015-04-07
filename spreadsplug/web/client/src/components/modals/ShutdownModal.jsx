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
import Icon from "components/utility/Icon.jsx";
import SystemActions from "actions/SystemActions";

export default React.createClass({
  displayName: "ShutdownModal",

  render: function() {
    return (
      <Modal {...this.props} bsStyle="primary" title="Shutdown/Reboot" animation={true}>
        <div className="modal-body">
          <h1>Shutdown/Reboot</h1>
          <p>Do you really want to shut down the device?</p>
          <p>
            <strong>
              If you do, please make sure that you turn off your devices before confirming!
            </strong>
          </p>
        </div>
        <div className="modal-footer">
          <Button bsStyle="danger" onClick={SystemActions.shutdown}>
            <Icon name="power-off" /> Shutdown
          </Button>
          <Button bsStyle="danger" onClick={SystemActions.reboot}>
            <Icon name="refresh" /> Reboot
          </Button>
        </div>
      </Modal>
    );
  }
});
