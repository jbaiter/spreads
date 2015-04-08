/*
 * Spreads - Modular workflow assistant for book digitization
 * Copyright (C) 2013-2015 Johannes Baiter <johannes.baiter@gmail.com>
 *
 * This file is part of Spreads.
 *
 * Spreads is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Spreads is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Spreads.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from "react";
import {Input, Button, Table, Pager, PageItem} from "react-bootstrap";
import ListenerMixin from "alt/mixins/ListenerMixin";

import Icon from "components/utility/Icon.jsx";
import Pagination from "components/utility/Pagination";
import loggingStore from "stores/LoggingStore";

const {PropTypes} = React;

const LEVEL_MAPPING = {
  debug: 10,
  info: 20,
  warning: 30,
  warn: 30,
  error: 40,
  critical: 50,
  fatal: 50
};

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
  propTypes: {
    params: PropTypes.object,
    query: PropTypes.object
  },

  getInitialState() {
    return {
      records: loggingStore.getState().records,
      perPage: 25,
      offset: 0,
      maxLevel: "warning"
    };
  },

  componentDidMount() {
    this.listenTo(loggingStore, this.onChange);
  },

  onChange() {
    this.setState({
      records: this.getInitialState().records
    });
  },

  handlePageChange(pageNum) {
    this.setState({
      offset: Math.floor((pageNum - 1) * this.state.perPage)
    });
  },

  getPageNum() {
    return Math.floor(this.state.offset / this.state.perPage) + 1;
  },

  render() {
    const {offset, perPage} = this.state;
    const filteredRecords = this.state.records.filter((rec) => {
      return LEVEL_MAPPING[rec.level.toLowerCase()] >= LEVEL_MAPPING[this.state.maxLevel];
    });
    const recordsToShow = filteredRecords.slice(offset, offset + perPage);
    const totalPages = Math.ceil(filteredRecords.length / perPage);
    return (
      <div>
        <h1>Application Log</h1>
        <Input type="select" label="Verbosity" value={this.state.maxLevel}
               onChange={(e) => this.setState({maxLevel: e.target.value})}>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </Input>
          <Input type="select" label="Record per page" value={this.state.perPage}
                 onChange={(e) => this.setState({perPage: e.target.value | 0})}>
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
            {recordsToShow.map((record, idx) => {
            return <LogRecord record={record} key={`record-${record.time}-${idx}`} />;})}
          </tbody>
        </Table>
        {totalPages > 1 &&
        <Pagination pageNum={this.getPageNum()} totalPages={totalPages}
                    onPageChange={this.handlePageChange} />}
      </div>
    );
  }
});
