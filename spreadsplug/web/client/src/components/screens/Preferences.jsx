import React from "react";
import t from "tcomb-form";
import ListenerMixin from "alt/mixins/ListenerMixin";

import alt from "alt";
import getConfigSchema from "forms/schemata/configSchema.js";
import appStateStore from "stores/AppStateStore.js";
import configActions from "actions/ConfigActions.js";

const {PropTypes} = React;

export default React.createClass({
  displayName: "Preferences",
  mixins: [ListenerMixin],
  propTypes: {
    params: PropTypes.object,
    query: PropTypes.object
  },

  componentDidMount() {
    this.listenTo(appStateStore, this.handleAppStateChange);
  },

  getInitialState() {
    const {config, availablePlugins, configTemplates} = appStateStore.getState();
    return {
      config: config,
      templates: configTemplates,
      availablePlugins: availablePlugins
    };
  },

  handleSubmit() {
    configActions.update(this.state.config);
  },

  handleAppStateChange() {
    const {config, availablePlugins, configTemplates} = appStateStore.getState();
    this.setState({
      config: config,
      templates: configTemplates,
      availablePlugins: availablePlugins
    });
  },

  render() {
    const schema = getConfigSchema({
      currentValues: this.state.config,
      availablePlugins: this.state.availablePlugins,
      templates: this.state.templates
    });
    const structs = schema.structs;
    const options = {fields: schema.fieldConfig};

    return (
      <div>
        <h2>Preferences</h2>
        <form className="form-horizontal" onSubmit={this.handleSubmit}>
          <t.form.Form type={t.struct(structs)} options={options}
            value={this.state.config} ref="form"
            onChange={(data) => this.setState({config: data})} />
          <button className="btn btn-primary">Submit</button>
        </form>
      </div>
    );
  }
});
