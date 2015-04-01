import React from "react";
import t from "tcomb-form";
import each from "lodash/collection/each";
import map from "lodash/collection/map";
import values from "lodash/object/values";

const TYPE_MAP = {
  "boolean": t.Bool,
  "string": t.Str,
  "number": t.Num
};

function CustomSelectTemplate(locals) {
  const CustomSelect = React.createClass({
    displayName: "CustomSelect",

    getInitialState() {
      if (!locals.value) {
        return {
          selectedOptions: []
        };
      }
      return {
        selectedOptions: locals.options.filter(
          option => locals.value.indexOf(option.value) !== -1
        )
      };
    },

    onChange(value, isChecked) {
      let currentValues;
      if (locals.value) {
        currentValues = [].concat(locals.value);
      } else {
        currentValues = [];
      }
      if (isChecked) {
        currentValues.push(value);
      } else {
        currentValues = currentValues.filter(val => val !== value);
      }
      locals.onChange(currentValues);
    },

    render() {
      return (
        <fieldset>
        <legend>{locals.name}</legend>
        <ul className="list-unstyled">
          {map(locals.config.categories, (fieldKeys, categoryName) => {
            return (
              <li key={categoryName}>
                <em className="help-block">{categoryName}</em>
                <ul className="list-unstyled">
                  {fieldKeys.map((key) => {
                    const inputId = [categoryName, key].join(".");
                    const isChecked = locals.value && locals.value.indexOf(key) !== -1;
                    const text = locals.options.filter(option => option.value === key)[0].text;
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
  return <CustomSelect />;
}

function checkDependency(currentValues, dependency) {
  // FIXME: That doesn't work
  return Object.keys(dependency).reduce((key, stillChecks) => {
    if (typeof dependency[key] === "object") {
      return stillChecks !== false && checkDependency(currentValues[key], dependency[key]);
    } else {
      return stillChecks !== false && currentValues[key] === dependency[key];
    }
  }, undefined);
}

function getField(tmpl) {
  const valType = typeof tmpl.value;
  if (valType === "object") {
    // Must be an array, since we don't allow maps as values.
    if (tmpl.selectable) {
      let opts = {};
      tmpl.value.forEach((val) => {
        opts.val = val;
      });
      return t.enums(opts);
    } else {
      return t.list(TYPE_MAP[typeof tmpl.value[0]]);
    }
  } else {
    return TYPE_MAP[valType];
  }
}

export function getConfigFormSchema({currentValues, availablePlugins, templates}) {
  const allPlugins = [].concat(...values(availablePlugins));
  let schema = {
    structs: {
      showAdvanced: t.Bool,
      plugins: t.enums(allPlugins.reduce((prev, cur) => {
        prev[cur] = cur;
        return prev;
      }, {}))
    },
    fieldConfig: {
      plugins: {
        factory: t.form.select,
        template: CustomSelectTemplate,
        multiple: true,
        config: {
          categories: availablePlugins
        }
      }
    }
  };

  each(templates, (keys, setName) => {
    if (["core", "device"].concat(currentValues.plugins).indexOf(setName) === -1) {
      return;
    }
    let kwargs = {};
    schema.fieldConfig[setName] = {fields: {}};
    each(keys, (data, name) => {
      if (data.advanced && !currentValues.showAdvanced) {
        return;
      }
      if (data.depends && !checkDependency(currentValues, data.depends)) {
        return;
      }
      schema.fieldConfig[setName].fields[name] = {
        help: data.docstring
      };
      const fieldType = getField(data);
      kwargs[name] = fieldType;
      if (fieldType.name === "List") {
        schema.fieldConfig[setName].fields[name] = {
          disableAdd: true,
          disableRemove: true,
          disableOrder: true
        };
      }
    });
    schema.structs[setName] = t.struct(kwargs);
  });
  return schema;
}
