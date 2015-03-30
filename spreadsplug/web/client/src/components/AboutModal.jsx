import React from "react";
import {Modal, Button} from "react-bootstrap";
import LOGO_URL from "../../../../../doc/_static/logo.png";

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
          <img src={LOGO_URL} className="about-logo" />
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
