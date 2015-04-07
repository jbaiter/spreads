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
    const {config, allPlugins, configTemplates} = appStateStore.getState();
    return {
      config: config,
      templates: configTemplates,
      allPlugins: allPlugins
    };
  },

  handleSubmit() {
    configActions.update(this.state.config);
  },

  handleAppStateChange() {
    const {config, allPlugins, configTemplates} = appStateStore.getState();
    this.setState({
      config: config,
      templates: configTemplates,
      allPlugins: allPlugins
    });
  },

  render() {
    // TODO: Add possibility to configure driver
    const schema = getConfigSchema({
      currentValues: this.state.config,
      availablePlugins: this.state.allPlugins,
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
