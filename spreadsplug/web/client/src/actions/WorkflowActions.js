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

import {makeJsonRequest, makeUrl as _makeUrl} from "utils/WebAPIUtils.js";
import alt from "alt";

const makeUrl = _makeUrl.bind(null, "/api/workflow");

class WorkflowActions {
  constructor() {
    this.generateActions("remotelyCreated",
                         "remotelyUpdated",
                         "remotelyDeleted",
                         "submissionProgressed",
                         "transferProgressed",
                         "actionFailed");
    // TODO: "actionFailed" should probably be a bit more involved and contain
    // the type of action that failed
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
