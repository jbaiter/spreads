import alt from "../alt";
import WorkflowActions from "../actions/WorkflowActions";

class WorkflowStore {
  constructor() {
    this.workflows = {};

    this.bindListeners({
      handleUpdated: [WorkflowActions.remotelyCreated,
                      WorkflowActions.remotelyUpdated],
      handleDeleted: WorkflowActions.remotelyDeleted
    });
  }

  handleUpdated(workflow) {
    if (this.workflows.hasOwnProperty(workflow.id)) {
      Object.assign(this.workflows[workflow.id], workflow);
    } else {
      this.workflows[workflow.id] = workflow;
    }
  }

  handleDeleted(workflow) {
    delete this.workflows[workflow.id];
  }
}

export default alt.createStore(WorkflowStore, "WorkflowStore");
