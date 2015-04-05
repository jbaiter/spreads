import React from "react";
import t from "tcomb-form";
import ActionListeners from "alt/utils/ActionListeners";
import ListenerMixin from "alt/mixins/ListenerMixin";

import alt from "../alt";
import {AutocompleteTextboxTemplate, getConfigFormSchema} from "../utils/FormUtils.js";
import WorkflowActions from "../actions/WorkflowActions.js";
import workflowStore from "../stores/WorkflowStore.js";
import appStateStore from "../stores/AppStateStore.js";

const {PropTypes} = React;
const actionListener = new ActionListeners(alt);

function getMetadataFormSchema(templates) {
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

export default React.createClass({
  displayName: "WorkflowForm",
  mixins: [ListenerMixin],
  propTypes: {
    params: PropTypes.object,
    query: PropTypes.object
  },
  contextTypes: {
    router: PropTypes.func
  },

  componentDidMount() {
    this.listenTo(appStateStore, this.handleAppStateChange);
  },

  getInitialState() {
    const {config, metadata} = this.props.params.id ?
      workflowStore.getState()[this.props.params.id] :
      {config: {plugins: []}, metadata: {}};
    // TODO: Load default config instead
    const {plugins, configTemplates, metadataSchema} = appStateStore.getState();
    return {
      configValues: config,
      metadataValues: metadata,
      configTemplates,
      availablePlugins: plugins,
      metadataSchema
    };
  },

  handleSubmit() {
    const data = {metadata: this.state.metadataValues,
                  config: this.state.configValues};
    if (this.props.params.id) {
      WorkflowActions.update(data);
    } else {
      WorkflowActions.create(data);
    }
  },

  handleAppStateChange() {
    const {plugins, templates} = appStateStore.getState();
    this.setState({
      configTemplates: templates,
      availablePlugins: plugins
    });
    actionListener.addActionListener(WorkflowActions.remotelyCreated, this.handleCreated);
    actionListener.addActionListener(WorkflowActions.actionFailed, this.handleCreateFailed);
  },

  handleConfigChange(value) {
    let newData = this.state.configValues;
    Object.assign(newData, value);
    this.setState({configValues: newData});
  },

  handleMetadataChange(value) {
    let newData = this.state.metadataValues;
    Object.assign(newData, value);
    this.setState({metadataValues: newData});
  },

  handleCreated(remoteData) {
    // NOTE: We can somewhat safely do this comparisons, since titles are
    // expected to be unique on the backend
    if (remoteData.metadata.title === this.metadataValues.title) {
      // TODO: Create that route
      //this.context.router.transitionTo("capture", {workflowId: remoteData.id});
      this.context.router.transitionTo("home");
    }
  },

  handleCreateFailed(error) { // eslint-disable-line no-unused-vars
    actionListener.removeAllActionListeners();
    // TODO: Display error, highlight invalid fields
  },

  render() {
    const configSchema = getConfigFormSchema({
      currentValues: this.state.configValues,
      availablePlugins: this.state.availablePlugins,
      templates: this.state.configTemplates
    });
    const configStructs = configSchema.structs;
    const configOptions = {fields: configSchema.fieldConfig};
    const metaSchema = getMetadataFormSchema(this.state.metadataSchema);

    // Enable autocompletion for book titles
    if (metaSchema.structs.hasOwnProperty("title")) {
      metaSchema.fieldConfig.title = {
        template: AutocompleteTextboxTemplate,
        config: {
          onAutocompleted: this.handleMetadataChange
        }
      };
    }

    const metaStructs = metaSchema.structs;
    const metaOptions = {fields: metaSchema.fieldConfig};
    const headlineText = this.props.params.id ?
      `Edit "${this.state.metaValues.title}"` :
      `New Workflow`;
    return (
      <div>
        <h2>{headlineText}</h2>
        <form className="form-horizontal" onSubmit={this.handleSubmit}>
          <t.form.Form type={t.struct(metaStructs)} options={metaOptions}
                      value={this.state.metadataValues} ref="metadataForm"
                      onChange={this.handleMetadataChange}/>
          <t.form.Form type={t.struct(configStructs)} options={configOptions}
                      value={this.state.configValues} ref="configForm"
                      onChange={this.handleConfigChange} />
          <button className="btn btn-primary">
            {this.props.params.id ? "Edit" : "Create"}
          </button>
        </form>
      </div>
    );
  }
});
