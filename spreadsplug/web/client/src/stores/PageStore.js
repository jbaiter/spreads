import alt from "../alt";
import WorkflowActions from "../actions/WorkflowActions";
import PageActions from "../actions/PageActions";

class WorkflowStore {
  constructor() {
    this.pages = {};

    this.bindListeners({
      handleWorkflowCreated: WorkflowActions.REMOTELY_CREATED,
      handleWorkflowDeleted: WorkflowActions.REMOTELY_DELETED,
      handleDeleted: PageActions.REMOTELY_DELETED,
      handleCropped: PageActions.REMOTELY_CROPPED
    });
  }

  handleDeleted(page) {
    delete this.pages[page.workflow_id][page.capture_num];
  }

  handleWorkflowCreated(workflow) {
    this.pages[workflow.id] = {};
  }

  handleWorkflowDeleted(workflow) {
    delete this.pages[workflow.id];
  }
}

export default alt.createStore(WorkflowStore, "WorkflowStore");
