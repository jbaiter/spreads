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

import t from "tcomb-form";
import each from "lodash/collection/each";
import values from "lodash/object/values";

import {checkDependency, getFieldFromConfigTemplate, listTransformer} from "utils/FormUtils";
import CustomSelectTemplate from "forms/templates/CustomSelectTemplate";

export default function getConfigSchema({currentValues, availablePlugins, templates,
                                         blacklistedCategories=[]}) {
  if (blacklistedCategories.indexOf("core") !== -1) {
    delete templates.core;
  }
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
        Object.assign(
          schema.fieldConfig[setName].fields[name],
          {
            factory: t.form.Textbox,
            transformer: listTransformer,
            help: [data.docstring, "Separate by comma"].join(". ")
          });
      }
    });
    schema.structs[setName] = t.struct(kwargs);
  });
  return schema;
}
