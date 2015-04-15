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

import {fetchJson, makeUrl, makeParams} from "utils/WebAPIUtils.js";
import alt from "alt";

class PageActions {
  constructor() {
    this.generateActions("remotelyDeleted", "remotelyCropped", "actionFailed",
                      "remotelyUpdated");
  }

  updateOne(data) {
    this.dispatch();
    fetchJson(
      makeUrl("/api/workflow", data.workflow_id, "page", data.capture_num),
      {method: "put", body: data})
      .then((data) => this.actions.remotelyUpdated(data))
      .catch((error) => this.actions.actionFailed(error));
  }

  updateMany(pages) {
    this.dispatch();
    fetchJson(
      makeUrl("/api/workflow", pages[0].workflow_id, "page"),
      {method: "put", body: {pages}})
      .then((data) => this.actions.remotelyUpdated(data))
      .catch((error) => this.actions.actionFailed(error));
  }

  deleteOne({workflowId, pageId}) {
    this.dispatch();
    fetchJson(makeUrl("/api/workflow", workflowId, "page", pageId),
              {method: "delete"})
      .then((data) => this.actions.remotelyDeleted(data))
      .catch((error) => this.actions.actionFailed(error));
  }

  deleteMany({workflowId, pageIds}) {
    this.dispatch();
    fetchJson(makeUrl("/api/workflow", workflowId, "page"),
                      {method: "delete", body: {pages: pageIds}})
      .then((data) => this.actions.remotelyDeleted(data))
      .catch((error) => this.actions.actionFailed(error));
  }
}

export default alt.createActions(PageActions);
