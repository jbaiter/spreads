import React from "react";

import AutocompleteTextbox from "components/utility/AutocompleteTextbox.jsx";

export default function AutocompleteTextboxTemplate(locals) {
  function handleChange(selectedItem) {
    if (selectedItem.identifier) {
      locals.config.onAutocompleted(selectedItem);
    } else {
      locals.onChange(selectedItem.title);
    }
  }

  return (<AutocompleteTextbox value={locals.value} name={locals.name}
                               onChange={handleChange} />);
}
