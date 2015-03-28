import * as fetch from "fetch";

import alt from "../alt";
import {makeUrl, makeParams} from "../utils/WebAPIUtils.js";

class CaptureActions {
  constructor() {
    this.generateActions("prepared", "triggered", "succeeded", "failed", "finished");
  }

  prepare({workflowId, reset}) {
    this.dispatch();
    fetch(
      makeUrl("/api/workflow", workflowId,
              "prepare_capture" + makeParams({reset: reset})),
      {method: "post"})
      .then(() => this.actions.prepared)
      .catch((error) => this.actions.failed(error));
  }

  trigger({workflowId, retake}) {
    fetch(
      makeUrl("/api/workflow", workflowId,
              "capture" + makeParams({retake: retake})),
      {method: "post"})
      .catch((error) => this.actions.failed(error));
  }

  finish({workflowId}) {
    fetch(makeUrl(
      "/api/workflow", workflowId, "finish_capture"),
      {method: "post"})
      .then(() => this.actions.finished)
      .catch((error) => this.actions.failed(error));
  }
}

export default alt.createActions(CaptureActions);
