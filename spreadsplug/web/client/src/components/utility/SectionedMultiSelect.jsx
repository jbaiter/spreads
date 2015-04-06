import React from "react";
import map from "lodash/collection/map";

const {PropTypes} = React;

export default React.createClass({
    displayName: "SectionedMultiSelect",
    propTypes: {
      value: PropTypes.array,
      options: PropTypes.arrayOf(React.PropTypes.object).isRequired,
      categories: PropTypes.object.isRequired,
      name: PropTypes.string.isRequired,
      onChange: PropTypes.func.isRequired
    },

    getDefaultProps() {
      return {
        value: []
      };
    },

    getInitialState() {
      if (!this.props.value) {
        return {
          selectedOptions: []
        };
      }
      return {
        selectedOptions: this.props.options.filter(
          option => this.props.value.indexOf(option.value) !== -1
        )
      };
    },

    onChange(value, isChecked) {
      let currentValues;
      if (this.props.value) {
        currentValues = [].concat(this.props.value);
      } else {
        currentValues = [];
      }
      if (isChecked) {
        currentValues.push(value);
      } else {
        currentValues = currentValues.filter(val => val !== value);
      }
      this.props.onChange(currentValues);
    },

    render() {
      return (
        <fieldset>
        <legend>{this.props.name}</legend>
        <ul className="list-unstyled">
          {map(this.props.categories, (fieldKeys, categoryName) => {
            if (fieldKeys.length === 0) {
              return null;
            }
            return (
              <li key={categoryName}>
                <em className="help-block">{categoryName}</em>
                <ul className="list-unstyled">
                  {fieldKeys.map((key) => {
                    const inputId = [categoryName, key].join(".");
                    const isChecked = this.props.value && this.props.value.indexOf(key) !== -1;
                    const text = this.props.options.filter(option => option.value === key)[0].text;
                    return (
                      <li className="checkbox" key={inputId}>
                        <label htmlFor={inputId}>
                          <input type="checkbox" id={inputId} checked={isChecked}
                                 onChange={this.onChange.bind(this, key)}/> {text}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
        </fieldset>
      );
    }
  });

