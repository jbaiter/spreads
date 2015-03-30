import alt from "../alt";
import ConfigActions from "../actions/ConfigActions.js";
import SystemActions from "../actions/SystemActions.js";

class AppStateStore {
  constructor() {
    this.config = {};
    this.plugins = {};
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
