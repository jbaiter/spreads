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
