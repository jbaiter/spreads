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

import alt from "alt";
import ConfigActions from "actions/ConfigActions.js";
import SystemActions from "actions/SystemActions.js";

class AppStateStore {
  constructor() {
    this.config = {};
    this.enabledPlugins = {};
    this.allPlugins = {};
    this.configTemplates = {};
    this.metadataSchema = {};
    this.isOffline = false;

    this.bindListeners({
      handleUpdated: ConfigActions.REMOTELY_UPDATED,
      handleDisconnect: SystemActions.DISCONNECTED,
      handleReconnect: SystemActions.RECONNECTED
    });
  }

  handleUpdated(config) {
    Object.assign(this.config, config);
  }

  handleDisconnect() {
    this.isOffline = true;
  }

  handleReconnect() {
    this.isOffline = false;
    // TODO: Re-bootstrap alt state
  }
}

export default alt.createStore(AppStateStore, "AppStateStore");
