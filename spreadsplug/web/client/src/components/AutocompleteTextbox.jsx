import React from "react";
const {PropTypes} = React;
import each from "lodash/collection/each";
import debounce from "lodash/function/debounce";

import {makeUrl, makeParams} from "../utils/WebAPIUtils.js";

const Suggestion = React.createClass({
  displayName: "Suggestion",
  propTypes: {
    onClick: PropTypes.func,
    data: PropTypes.object
  },

  render() {
    const data = this.props.data;
    let desc = "";
    if (data.hasOwnProperty("creator")) {
      desc += data.creator.join("/") + ": ";
    }
    desc += (data.title || "");
    if (data.hasOwnProperty("date")) {
      desc += " (" + data.date + ")";
    }
    return (
      <li onClick={this.props.onClick}>{desc}</li>
    );
  }
});

const SuggestionList = React.createClass({
  displayName: "SuggestionList",
  propTypes: {
    suggestions: React.PropTypes.array,
    onSelect: React.PropTypes.func
  },

  render() {
    const enumerated = Array.from(this.props.suggestions.entries());
    const nodes = enumerated.map(([key, data]) =>
      (<Suggestion key={key} data={data}
                   onClick={() => this.props.onSelect(data)} />));
    return (
      <ul className="autocomplete-suggestions">
        {nodes}
      </ul>
    );
  }
});

export default React.createClass({
  displayName: "AutocompleteTextbox",
  propTypes: {
    value: React.PropTypes.string,
    name: React.PropTypes.string,
    onChange: React.PropTypes.func
  },

  componentDidMount() {
    this.makeCall = debounce(this.makeCall, 500);
  },

  getInitialState() {
    return {
      completeEnabled: true,
      suggestions: [],
      lastTerm: "",
      call: {latest: 0,
              term: ""}
    };
  },

  makeCall(term, current) {
    fetch(makeUrl("/api", "isbn") + makeParams({q: term}))
      .then((resp) => resp.json()).then((json) => {
        if (current === this.state.call.latest) {
          const newPriority = this.state.call.latest - 1;
          this.setState({
            suggestions: json.results,
            lastTerm: this.state.call.term,
            call: {latest: newPriority,
                    term: ""}
          });
        }
      }).catch((error) => { // eslint-disable-line
        this.setState({completeEnabled: false});
      });
  },

  //set state if user enters at least 3 chars, also reset state if user clears input box.
  handleKeyUp(e) {
    e.stopPropagation();
    const k = e.target.value;
    if (k.length > 3 && k !== this.state.lastTerm && k !== this.state.call.term) {
      const priority = this.state.call.latest+1;
      this.setState({
        call: {latest: priority,
                term: k}
      });
    }
    if (k.length === 0) {
      this.setState({
        completeEnabled: true,
        suggestions: [],
        call: {latest: 0,
                term: ""}
        });
    }
  },

  handleSelect(item) {
    this.setState({
      completeEnabled: false,
      suggestions: [],
      call: {latest: 0,
              term: ""}
    });
    each(item, (value, key) => {
      delete item[key];
      item[key.toLowerCase()] = value;
    });
    this.props.onChange(item);
  },

  render() {
    // if the incoming state contains a search term with a real priority then
    // make the async ajax/json calls
    if (this.state.call.latest > 0 && this.state.call.term !== "" &&
        this.state.call.term !== this.state.lastTerm && this.state.completeEnabled) {
      this.makeCall(this.state.call.term, this.state.call.latest);
    }
    return (
      <div>
        <label htmlFor={this.props.name + "-input"}>
          {this.props.name}
          <input type="text" placeholder="Enter a search-term to get a list of suggestions"
                 value={this.props.value} ref="input" id={this.props.name + "-input"}
                 onChange={(e) => this.props.onChange({"title": e.target.value})}
                 onKeyUp={this.handleKeyUp} />
        </label>
        <SuggestionList suggestions={this.state.suggestions} onSelect={this.handleSelect} />
      </div>
    );
  }
});


