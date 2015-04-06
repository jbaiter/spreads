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
