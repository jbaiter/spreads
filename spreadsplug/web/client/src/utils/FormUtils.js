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

const TYPE_MAP = {
  "boolean": t.Bool,
  "string": t.Str,
  "number": t.Num
};

export function checkDependency(currentValues, dependency) {
  // FIXME: That doesn't work
  return Object.keys(dependency).reduce((key, stillChecks) => {
    if (typeof dependency[key] === "object") {
      return stillChecks !== false && checkDependency(currentValues[key], dependency[key]);
    } else {
      return stillChecks !== false && currentValues[key] === dependency[key];
    }
  }, undefined);
}

export function getFieldFromConfigTemplate(tmpl) {
  const valType = typeof tmpl.value;
  if (valType === "object") {
    // Must be an array, since we don't allow maps as values.
    if (tmpl.selectable) {
      return t.enums.of(tmpl.value);
    } else {
      return t.list(TYPE_MAP[typeof tmpl.value[0]]);
    }
  } else {
    return TYPE_MAP[valType];
  }
}
