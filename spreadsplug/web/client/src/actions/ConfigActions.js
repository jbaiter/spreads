import "whatwg-fetch";
import {makeJsonRequest} from "../utils/WebAPIUtils.js";
import alt from "../alt";

class ConfigActions {
  constructor() {
    this.generateActions("remotelyUpdated", "updateFailed");
  }

  update(config) {
    makeJsonRequest("/api/config", "put", config)
      .then((resp) => this.actions.remotelyUpdated(resp.json()))
      .catch((error) => this.actions.updateFailed(error.json()));
  }
}

export default alt.createActions(ConfigActions);
