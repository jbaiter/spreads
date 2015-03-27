var _ = {
  partial: require('lodash/function/partial')
};
var makeJsonRequest = require('../utils/WebAPIUtils.js').makeJsonRequest;
var makeUrl = _.partial(require('../utils/WebAPIUtils.js').makeUrl,
                        '/api/workflow');
var alt = require('../alt');

class WorkflowActions {
  constructor() {
    this.generateActions('remotelyCreated',
                         'remotelyUpdated',
                         'remotelyDeleted',
                         'submissionProgressed',
                         'submissionProgressed',
                         'transferProgressed',
                         'actionFailed');
  }

  create(data) {
    this.dispatch();
    makeJsonRequest(makeUrl(), 'post', data)
      .then((resp) => this.actions.remotelyCreated(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  update(data) {
    this.dispatch();
    makeJsonRequest(makeUrl(data.id), 'post', data)
      .then((resp) => this.actions.remotelyUpdated(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  delete(workflowId) {
    this.dispatch();
    makeJsonRequest(makeUrl(workflowId), 'delete', {})
      .then((resp) => this.actions.remotelyDeleted(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  submitToRemote(params) {
    this.dispatch();
    makeJsonRequest(makeUrl(params.workflowId, 'submit'), 'post', params)
      .then((resp) => this.actions.submissionProgressed(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  transferToStorage(params) {
    this.dispatch();
    makeJsonRequest(makeUrl(params.workflowId, 'transfer'), 'post', params)
      .then((resp) => this.actions.transferProgressed(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  startPostprocessing(params) {
    makeJsonRequest(makeUrl(params.workflowId, 'process'), 'post', params)
      .then(() => this.dispatch())
      .catch(error => this.actions.actionFailed(error.json()));
  }

  startOutputting(params) {
    makeJsonRequest(makeUrl(params.workflowId, 'output'), 'post', params)
      .then(() => this.dispatch())
      .catch(error => this.actions.actionFailed(error.json()));
  }
}

module.exports = alt.createActions(WorkflowActions);
