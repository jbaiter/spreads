import "whatwg-fetch";
import throttle from "lodash/function/throttle";
import makeParams from "../utils/WebAPIUtils.js"
import WorkflowActions from "../actions/WorkflowActions.js";
import CaptureActions from "../actions/CaptureActions.js";
import SystemActions from "../actions/SystemActions.js";
import LoggingActions from "../actions/LoggingActions.js";

const ACTION_MAPPING = {
  "workflow:removed": WorkflowActions.remotelyDeleted,
  "workflow:capture-triggered": CaptureActions.triggered,
  "workflow:capture-succeeded": CaptureActions.succeeded,
  "workflow:capture-failed": CaptureActions.failed,
  "workflow:modified": WorkflowActions.remotelyUpdated.bind(
    WorkflowActions, (data) => data.changes),
  "logrecord": LoggingActions.newRecord
};

class Poller {
  start({onEvents, onError}) {
    this.onEvents = onEvents;
    this.onError = onError;
  }

  doPoll() {
    if (this.disabled) { return; }
    let args = {};
    if (this.cursor) {
      args.cursor = this.cursor;
    }
    fetch("/api/poll" + makeParams(args), {method: "post"})
      .then((resp) => {
        this.onEvents(this.newEvents(resp.json()));
        window.setTimeout(this.doPoll, 0);
      }).catch(this.onError);
  }

  newEvents({events}) {
    if (!events) { return []; }
    this.cursor = events[events.length - 1].id;
    console.log(events.length, "new events, cursor:", this.cursor);
    return events;
  }
}

export default class ServerEventListener {
  constructor() {
    this.checkOnline = throttle(() => {
      fetch("/", {method: "head"})
        .then(() => {
          SystemActions.reconnected();
          this.connect();
        })
        .catch(this.checkOnline);
    }, 5000);
  }

  connect() {
    if (window.MozWebSocket) {
      window.WebSocket = window.MozWebSocket;
    }
    if (window.WebSocket) { this.connectWS(); }
    else { this.connectPolling(); }
  }

  connectWS() {
    const hostName = window.location.hostname,
          port = parseInt(window.location.port) || 80;
    this.websocket = new WebSocket("ws://" + hostName + ":" + port + "/ws");
    this.websocket.onclose = () => {
      if (!this.websocket.onmessage) {
        console.warn("Could not open connection to WebSocket server " +
                      "at " + this.websocket.url + ", falling back to " +
                      "long polling.");
        this.connectPolling();
      }
    };
    this.websocket.onopen = () => {
      // Start listening to server events
      this.websocket.onmessage = (messageEvent) => {
        this.onEvent(JSON.parse(messageEvent.data));
      };
      this.websocket.onclose = () => {
        SystemActions.disconnected();
        this.checkOnline();
      };
    };
  }

  connectPolling() {
    this.poller = new Poller();
    this.poller.start({
      onEvents: (events) => events.forEach(this.onEvent),
      onError: () => {
        SystemActions.disconnected();
        this.checkOnline();
      }});
  }

  close() {
    if (this.poller) {
      this.poller.stop();
    } else {
      this.websocket.close();
    }
  }

  onEvent({name, data}) {
    ACTION_MAPPING[name](data);
  }
}
