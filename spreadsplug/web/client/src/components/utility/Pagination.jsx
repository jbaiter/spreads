import React from "react";
import classNames from "classnames";
import range from "lodash/utility/range";

const {PropTypes} = React;

const PageButton = React.createClass({
  displayName: "PageButton",
  propTypes: {
    onClick: PropTypes.func.isRequired,
    label: PropTypes.node.isRequired,
    srLabel: PropTypes.string,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    isRelative: PropTypes.bool
  },

  getDefaultProps() {
    return {
      srLabel: null,
      active: false,
      disabled: false,
      isRelative: false
    };
  },

  render() {
    const classes = classNames({
      disabled: this.props.disabled,
      active: this.props.active
    });
    let linkElem;
    if (this.props.isRelative) {
      linkElem = (
        <a href="#" onClick={this.props.onClick} aria-label={this.props.srLabel}>
          <span aria-hidden="true">{this.props.label}</span>
        </a>
      );
    } else {
      linkElem = (
        <a href="#" onClick={!(this.props.disabled || this.props.active) && this.props.onClick}>
          {this.props.label} {this.props.active && <span className="sr-only">(current)</span>}
        </a>
      );
    }
    return (
      <li className={classes}>
        {linkElem}
      </li>
    );
  }
});

export default React.createClass({
  displayName: "Pagination",
  propTypes: {
    pageNum: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    marginDisplay: PropTypes.number,
    rangeDisplay: PropTypes.number,
    size: PropTypes.oneOf(["lg", "med", "sm"])
  },

  getDefaultProps() {
    return {
      marginDisplay: 2,
      rangeDisplay: 5,
      size: "med"
    };
  },

  handleClick(pageNum) {
    this.props.onPageChange(pageNum);
  },

  getButtonLabels() {
    let {marginDisplay, rangeDisplay, totalPages, pageNum} = this.props;

    // Adjust settings for small page ranges
    if (rangeDisplay > totalPages) {
      marginDisplay = 0;
      rangeDisplay = totalPages;
    }
    else if ((marginDisplay * 2 + rangeDisplay) > totalPages) {
      marginDisplay = Math.floor((totalPages - rangeDisplay) / 2);
    }

    // Build sub-ranges first
    const centerMargin = Math.ceil((rangeDisplay - 1) / 2);
    const leftNumbers = new Set(range(1, marginDisplay+1));
    const rightNumbers = new Set(range(totalPages - marginDisplay + 1, totalPages + 1));
    let centerNumbers;
    if (pageNum - centerMargin < 1) {
      centerNumbers = new Set(range(1, rangeDisplay+1));
    } else if (pageNum + centerMargin > totalPages) {
      centerNumbers = new Set(range(totalPages - rangeDisplay + 1, totalPages + 1));
    } else {
      centerNumbers = new Set(range(pageNum - centerMargin, pageNum + centerMargin + 1));
    }

    // Combine them and remove all duplicates thanks to the Set type
    let combinedNumbers = new Set([...leftNumbers, ...centerNumbers, ...rightNumbers]);

    // Fill the gaps
    let out = [];
    for (let num of combinedNumbers) {
      let lastNum = out.length ? out.slice(-1)[0] : null;
      if (lastNum) {
        if ((num - lastNum) > 2) {
          out.push("...");
        } else if ((num - lastNum) === 2) {
          out.push(lastNum + 1);
        }
      }
      out.push(num);
    }
    return out;
  },

  render() {
    const {pageNum, totalPages} = this.props;
    const paginationClasses = classNames({
      pagination: true,
      "pagination-sm": this.props.size === "sm",
      "pagination-lg": this.props.size === "lg"
    });

    const enumeratedLabels = Array.from(this.getButtonLabels().entries());
    const buttons = enumeratedLabels.map(([idx, label]) => {
      return (<PageButton label={label} active={pageNum === label}
                          disabled={label === "..."} key={`page-btn-${idx}`}
                          onClick={() => this.handleClick(label)} />);
    });
    return (
      <nav>
        <ul className={paginationClasses}>
          <PageButton isRelative={true} disabled={pageNum === 1}
                      label="&laquo;" srLabel="previous"
                      onClick={() => this.handleClick(pageNum - 1)} />
          {buttons}
          <PageButton isRelative={true} disabled={pageNum === totalPages}
                      label="&raquo;" srLabel="next"
                      onClick={() => this.handleClick(pageNum + 1)} />
        </ul>
      </nav>
    );
  }
})
