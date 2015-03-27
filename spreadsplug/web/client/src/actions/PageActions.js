var _ = {
  map: require('lodash/collections/map')
};
var makeJsonRequest = require('../utils/WebAPIUtils.js').makeJsonRequest;
var makeUrl = require('../utils/WebAPIUtils.js');

var alt = require('../alt');

class PageActions {
  constructor() {
    this.generateActions('remotelyDeleted', 'remotelyCropped', 'actionFailed');
  }

  deleteOne(options) {
    this.dispatch();
    makeJsonRequest(makeUrl('/api/workflow', options.workflowId, 'page',
                            options.pageId), 'delete', {})
      .then((resp) => this.actions.remotelyDeleted(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  deleteMany(options) {
    this.dispatch();
    makeJsonRequest(makeUrl('/api/workflow', options.workflowId, 'page'),
                            'delete', {pages: options.pageIds})
      .then((resp) => this.actions.remotelyDeleted(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  crop(options) {
    var paramParts = _.map(
      options.cropParams,
      (val, key) => encodeURIComponent(key) + '=' + encodeURIComponent(val));
    makeJsonRequest(makeUrl('/api/workflow', options.workflowId, 'page',
                            options.pageId, 'crop?' + paramParts), 'post', {})
      .then(() => this.actions.remotelyCropped(options))
      .catch((error) => this.actions.actionFailed(error.json()));
  }
}

module.exports = alt.createActions(PageActions);
