import React from "react";
import SectionedMultiSelect from "../../components/SectionedMultiSelect.jsx";

export default function CustomSelectTemplate({value, options, onChange, name,
                                              config: {categories}}) {
  return (<SectionedMultiSelect value={value} options={options} onChange={onChange}
                                name={name} categories={categories} />);
}
