import {makeJsonRequest, makeUrl, makeParams} from "utils/WebAPIUtils.js";
import alt from "alt";

class PageActions {
  constructor() {
    this.generateActions("remotelyDeleted", "remotelyCropped", "actionFailed");
  }

  deleteOne({workflowId, pageId}) {
    this.dispatch();
    makeJsonRequest(makeUrl("/api/workflow", workflowId, "page",
                            pageId), "delete", {})
      .then((resp) => this.actions.remotelyDeleted(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  deleteMany({workflowId, pageIds}) {
    this.dispatch();
    makeJsonRequest(makeUrl("/api/workflow", workflowId, "page"),
                            "delete", {pages: pageIds})
      .then((resp) => this.actions.remotelyDeleted(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  crop({workflowId, pageId, cropParams}) {
    makeJsonRequest(
      makeUrl("/api/workflow", workflowId, "page", pageId,
              "crop" + makeParams(cropParams)),
      "post", {})
      .then(() => this.dispatch())
      .catch((error) => this.actions.actionFailed(error.json()));
  }
}

export default alt.createActions(PageActions);
