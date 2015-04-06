import React from "react";
import {Modal, Button} from "react-bootstrap";
import Icon from "../Icon.jsx";
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
