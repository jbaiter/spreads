import React from "react";

const {PropTypes} = React;

export default React.createClass({
  displayName: "Icon",
  propTypes: {
    name: PropTypes.string
  },

  render() {
    return <i className={"fa fa-" + this.props.name} />;
  }
});

