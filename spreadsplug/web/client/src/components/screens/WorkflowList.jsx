import React from "react";
import {Input, Button, Table, Pager, PageItem} from "react-bootstrap";
import ListenerMixin from "alt/mixins/ListenerMixin";
import map from "lodash/collection/map";

import Icon from "components/utility/Icon.jsx";
import Media from "components/utility/Media.jsx";
import {getImageUrl} from "utils/WebAPIUtils";
import workflowStore from "stores/WorkflowStore";
import pageStore from "stores/PageStore";

const {PropTypes} = React;

const WorkflowItem = React.createClass({
  displayName: "WorkflowItem",
  propTypes: {
    workflow: PropTypes.object.isRequired,
    pages: PropTypes.object.isRequired
  },

  render() {
    const imageUrl = this.props.pages ?
      getImageUrl({workflowId: this.props.workflow.id,
                   captureNum: this.props.pages[0].capture_num,
                   thumbnail: true}) : null;
    return (
      <Media media={<img src={imageUrl} />}>
        <h3>{this.props.workflow.metadata.title}</h3>
      </Media>
    );
  }
});

export default React.createClass({
  displayName: "WorkflowList",
  mixins: [ListenerMixin],

  getInitialState() {
    return {
      workflows: workflowStore.getState().workflows,
      pages: pageStore.getState().pages
    };
  },

  componentDidMount() {
    this.listenToMany([workflowStore, pageStore], this.onChange);
  },

  onChange() {
    this.setState(this.getInitialState());
  },

  render() {
    const workflowItems = map(
      this.state.workflows,
      wf => <WorkflowItem key={wf.id} workflow={wf} pages={this.state.pages[wf.id]} />);
    return (
      <div>
        <h1>Workflows</h1>
        <div>{workflowItems}</div>
      </div>
    );
  }
})
