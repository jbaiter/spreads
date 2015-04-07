import t from "tcomb-form";
import each from "lodash/collection/each";
import values from "lodash/object/values";

import {checkDependency, getFieldFromConfigTemplate} from "utils/FormUtils";
import CustomSelectTemplate from "forms/templates/CustomSelectTemplate";

export default function getConfigSchema({currentValues, availablePlugins, templates,
                                         blacklistedCategories=[]}) {
  each(availablePlugins, (value, key) => {
    if (blacklistedCategories.indexOf(key) !== -1) {
      availablePlugins[key].forEach((key) => delete templates[key]);
      delete availablePlugins[key];
    }
  });
  const allPlugins = [].concat(...values(availablePlugins));
  let schema = {
    structs: {
      showAdvanced: t.Bool,
      plugins: t.enums(allPlugins.reduce((prev, cur) => {
        if (cur && cur.length > 0) {
          prev[cur] = cur;
        }
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
      const fieldType = getFieldFromConfigTemplate(data);
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
