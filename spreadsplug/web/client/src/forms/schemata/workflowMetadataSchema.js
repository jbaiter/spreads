import t from "tcomb-form";

export default function getWorkflowMetadataSchema(templates) {
  return templates.reduce((cur, field) => {
    if (field.multivalued) {
      cur.structs[field.key] = t.list(t.Str);
    } else {
      cur.structs[field.key] = t.Str;
    }
    cur.fieldConfig[field.key] = {
      label: field.description
    };
    return cur;
  }, {structs: {}, fieldConfig: {}});
}
