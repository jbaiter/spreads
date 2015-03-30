import React from "react";

const {PropTypes} = React;

export default React.createClass({
  displayName: "MediaObject",
  propTypes: {
    media: PropTypes.node.isRequired,
    position: PropTypes.oneOf(["left", "right"]),
    align: PropTypes.oneOf(["top", "middle", "bottom"])
  },

  getDefaultProps() {
    return {
      position: "left",
      align: "top"
    };
  },

  render() {
    const mediaObj = (
      <div className={"media-" + this.props.position}>
        {this.props.media}
      </div>);
    return (
      <div className="media">
        {this.props.position === "left" && mediaObj}
        <div className="media-body">
          {this.props.children}
        </div>
        {this.props.position === "right" && mediaObj}
      </div>
    );
  }
});
