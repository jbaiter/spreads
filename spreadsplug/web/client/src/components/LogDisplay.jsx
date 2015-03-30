import React from "react";
import {Input, Button, Table, Pager, PageItem} from "react-bootstrap";
import ListenerMixin from "alt/mixins/ListenerMixin";

import Icon from "./Icon.jsx";
import loggingStore from "../stores/LoggingStore";

const {PropTypes} = React;

const LogRecord = React.createClass({
  displayName: "LogRecord",
  propTypes: {
    record: PropTypes.object
  },

  render() {
    // TODO: Styling
    // TODO: Bugreport-Modal
    return (
      <tr>
        <td>
          {this.props.record.origin}
        </td>
        <td>
          {this.props.record.message}
        </td>
        <td>
          {this.props.record.time}
        </td>
      </tr>
    );
  }
});

export default React.createClass({
  // TODO: Styling
  // TODO: Pagination
  displayName: "LogDisplay",
  mixins: [ListenerMixin],

  getInitialState() {
    return loggingStore.getState();
  },

  componentDidMount() {
    this.listenTo(loggingStore, this.onChange);
  },

  onChange() {
    this.setState(this.getInitialState());
  },

  render() {
    return (
      <div>
        <h1>Application Log</h1>
          <Input type="select" label="Loglevel">
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </Input>
          <Input type="select">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Input>
          <Button href="/api/log?level=debug&count=100" download="spreadslog.json">
            <Icon name="download" />
          </Button>
        <Table>
          <thead>
            <tr>
              <th>Logger</th>
              <th>Message</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {this.state.records.map((record, idx) => {
            return <LogRecord record={record} key={"record-" + idx} />;})}
          </tbody>
        </Table>
        <Pager>
          <PageItem previous href="#">&larr; Previous Page</PageItem>
          <PageItem next href="#">&rarr; Next Page</PageItem>
        </Pager>
      </div>
    );
  }
});
