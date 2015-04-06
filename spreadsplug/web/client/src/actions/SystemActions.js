import {makeUrl} from "../utils/WebAPIUtils.js";
import alt from "../alt";

class SystemActions {
  constructor() {
    this.generateActions("disconnected", "reconnected");
  }

  shutdown() {
    fetch(makeUrl("/api", "system", "shutdown"), {method: "post"});
  }

  reboot() {
    fetch(makeUrl("/api", "system", "reboot"), {method: "post"});
  }

  reset() {
    fetch(makeUrl("/api", "reset"), {method: "post"});
  }
}

export default alt.createActions(SystemActions);
