import React from "react";
import t from "tcomb-form";
import ActionListeners from "alt/utils/ActionListeners";
import ListenerMixin from "alt/mixins/ListenerMixin";
import map from "lodash/collection/map";
import {Modal, Button} from "react-bootstrap";

import alt from "../alt";
import {makeUrl, fetchJson} from "../utils/WebAPIUtils.js";
import getWorkflowConfigSchema from "../forms/schemata/workflowConfigSchema.js";
import getWorkflowMetadataSchema from "../forms/schemata/workflowMetadataSchema.js";
import AutocompleteTextboxTemplate from "../forms/templates/AutocompleteTextboxTemplate.jsx";
import WorkflowActions from "../actions/WorkflowActions.js";
import workflowStore from "../stores/WorkflowStore.js";
import appStateStore from "../stores/AppStateStore.js";
import Icon from "./Icon.jsx";

const {PropTypes} = React;
const actionListener = new ActionListeners(alt);

const ProposalModal = React.createClass({
  displayName: "ProposalModal",
  propTypes: {
    proposedData: PropTypes.object,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func
  },

  render() {
    return (
      <Modal {...this.props} bsStyle="primary" title="Automaticall fill metadata?"
             onRequestHide={this.props.onCancel}>
        <div className="modal-body">
          <p>
            We have found a match for the ISBN you entered.
            Do you want to automically fill in the other fields?
          </p>
          <dl>
          {[].concat(...map(this.props.proposedData, (value, key) => [
            <dt key={"term-" + key}>{key}</dt>,
            <dd key={"def-" + key}>{value}</dd>
          ]))}
          </dl>
        </div>
        <div className="modal-footer">
          <Button bsStyle="primary" onClick={this.props.onConfirm}>
            <Icon name="tick" /> Confirm
          </Button>
          <Button bsStyle="default" onClick={this.props.onCancel}>
            <Icon name="cross" /> Cancel
          </Button>
        </div>
      </Modal>
    );
  }
});

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
      metadataSchema,
      proposedMetadata: null,
      autofilled: false
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

  handleMetadataChange(value, fromAutocomplete=false) {
    let newData = this.state.metadataValues;
    Object.assign(newData, value);
    if (newData.identifier && !fromAutocomplete &&
        (!this.state.metadataValues.identifier !== newData.identifier)) {
      let isbnNo = null;
      newData.identifier.forEach((identifier) => {
        if (identifier && identifier.toLowerCase().startsWith("isbn:")) {
          isbnNo = identifier.toLowerCase().substring(5);
        }
      });
      if (isbnNo) {
        fetchJson(makeUrl("/api", "isbn", isbnNo))
          .then((data) => this.setState({proposedMetadata: data}))
          .catch((error) => console.log(error));
      }
    }
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
    const configSchema = getWorkflowConfigSchema({
      currentValues: this.state.configValues,
      availablePlugins: this.state.availablePlugins,
      templates: this.state.configTemplates
    });
    const configStructs = configSchema.structs;
    const configOptions = {fields: configSchema.fieldConfig};
    const metaSchema = getWorkflowMetadataSchema(this.state.metadataSchema);

    // Enable autocompletion for book titles
    if (metaSchema.structs.hasOwnProperty("title")) {
      metaSchema.fieldConfig.title = {
        template: AutocompleteTextboxTemplate,
        config: {
          onAutocompleted: (data) => this.handleMetadataChange(data, true)
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
        {this.state.proposedMetadata &&
          <ProposalModal
            proposedData={this.state.proposedMetadata}
            onConfirm={() => this.setState(
              {metadataValues: this.state.proposedMetadata,
               proposedMetadata: null})}
            onCancel={() => this.setState({proposedMetadata: null})} />}
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
