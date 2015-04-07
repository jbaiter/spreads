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

