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

import React from "react";
import t from "tcomb-form";
import ActionListeners from "alt/utils/ActionListeners";
import ListenerMixin from "alt/mixins/ListenerMixin";

import alt from "alt";
import {makeUrl, fetchJson} from "utils/WebAPIUtils.js";
import getConfigSchema from "forms/schemata/configSchema.js";
import getMetadataSchema from "forms/schemata/metadataSchema.js";
import AutocompleteTextboxTemplate from "forms/templates/AutocompleteTextboxTemplate.jsx";
import ProposalModal from "components/modals/ProposalModal.jsx";
import WorkflowActions from "actions/WorkflowActions.js";
import workflowStore from "stores/WorkflowStore.js";
import appStateStore from "stores/AppStateStore.js";

const {PropTypes} = React;
const actionListener = new ActionListeners(alt);

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
      {config: null, metadata: {}};
    const {config: defaultConfig, enabledPlugins, configTemplates,
           metadataSchema} = appStateStore.getState();
    return {
      configValues: config || defaultConfig,
      metadataValues: metadata,
      configTemplates,
      availablePlugins: enabledPlugins,
      metadataSchema,
      proposedMetadata: null,
      autofilled: false
    };
  },

  handleSubmit() {
    const data = {metadata: this.state.metadataValues,
                  config: this.state.configValues};
    actionListener.addActionListener(WorkflowActions.remotelyCreated, this.handleCreated);
    actionListener.addActionListener(WorkflowActions.actionFailed, this.handleCreateFailed);
    if (this.props.params.id) {
      WorkflowActions.update(data);
    } else {
      WorkflowActions.create(data);
    }
  },

  handleAppStateChange() {
    const {enabledPlugins, templates} = appStateStore.getState();
    this.setState({
      configTemplates: templates,
      availablePlugins: enabledPlugins
    });
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
      actionListener.removeAllActionListeners();
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
    const configSchema = getConfigSchema({
      currentValues: this.state.configValues,
      availablePlugins: this.state.availablePlugins,
      templates: this.state.configTemplates,
      blacklistedCategories: ["core", "subcommand"]
    });
    const configStructs = configSchema.structs;
    const configOptions = {fields: configSchema.fieldConfig};
    const metaSchema = getMetadataSchema(this.state.metadataSchema);

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
