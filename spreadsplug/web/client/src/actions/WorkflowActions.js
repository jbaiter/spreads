import {makeJsonRequest, makeUrl as _makeUrl} from "../utils/WebAPIUtils.js";
import alt from "../alt";

const makeUrl = _makeUrl.bind(null, "/api/workflow");

class WorkflowActions {
  constructor() {
    this.generateActions("remotelyCreated",
                         "remotelyUpdated",
                         "remotelyDeleted",
                         "submissionProgressed",
                         "transferProgressed",
                         "actionFailed");
  }

  create(data) {
    this.dispatch();
    makeJsonRequest(makeUrl(), "post", data)
      .then((resp) => this.actions.remotelyCreated(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  update(data) {
    this.dispatch();
    makeJsonRequest(makeUrl(data.id), "post", data)
      .then((resp) => this.actions.remotelyUpdated(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  delete(workflowId) {
    this.dispatch();
    makeJsonRequest(makeUrl(workflowId), "delete", {})
      .then((resp) => this.actions.remotelyDeleted(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  submitToRemote(params) {
    this.dispatch();
    makeJsonRequest(makeUrl(params.workflowId, "submit"), "post", params)
      .then((resp) => this.actions.submissionProgressed(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  transferToStorage(params) {
    this.dispatch();
    makeJsonRequest(makeUrl(params.workflowId, "transfer"), "post", params)
      .then((resp) => this.actions.transferProgressed(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  startPostprocessing(params) {
    makeJsonRequest(makeUrl(params.workflowId, "process"), "post", params)
      .then(() => this.dispatch())
      .catch(error => this.actions.actionFailed(error.json()));
  }

  startOutputting(params) {
    makeJsonRequest(makeUrl(params.workflowId, "output"), "post", params)
      .then(() => this.dispatch())
      .catch(error => this.actions.actionFailed(error.json()));
  }
}

export default alt.createActions(WorkflowActions);
