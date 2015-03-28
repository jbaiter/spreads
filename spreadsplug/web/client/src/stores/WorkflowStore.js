import assign from "lodash/object/assign";
import has from "lodash/object/has";
import alt from "../alt";
import WorkflowActions from "../actions/WorkflowActions";

class WorkflowStore {
  constructor() {
    this.workflows = {};

    this.bindListeners({
      handleUpdated: [WorkflowActions.REMOTELY_CREATED,
                      WorkflowActions.REMOTELY_UPDATED],
      handleDeleted: WorkflowActions.REMOTELY_DELETED
    });
  }

  handleUpdated(workflow) {
    if (has(this.workflows, workflow.id)) {
      assign(this.workflows[workflow.id], workflow);
    } else {
      this.workflows[workflow.id] = workflow;
    }
  }

  handleDeleted(workflow) {
    delete this.workflows[workflow.id];
  }
}

export default alt.createStore(WorkflowStore, "WorkflowStore");
