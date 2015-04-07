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

import {makeJsonRequest, makeUrl, makeParams} from "utils/WebAPIUtils.js";
import alt from "alt";

class PageActions {
  constructor() {
    this.generateActions("remotelyDeleted", "remotelyCropped", "actionFailed");
  }

  deleteOne({workflowId, pageId}) {
    this.dispatch();
    makeJsonRequest(makeUrl("/api/workflow", workflowId, "page",
                            pageId), "delete", {})
      .then((resp) => this.actions.remotelyDeleted(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  deleteMany({workflowId, pageIds}) {
    this.dispatch();
    makeJsonRequest(makeUrl("/api/workflow", workflowId, "page"),
                            "delete", {pages: pageIds})
      .then((resp) => this.actions.remotelyDeleted(resp.json()))
      .catch((error) => this.actions.actionFailed(error.json()));
  }

  crop({workflowId, pageId, cropParams}) {
    makeJsonRequest(
      makeUrl("/api/workflow", workflowId, "page", pageId,
              "crop" + makeParams(cropParams)),
      "post", {})
      .then(() => this.dispatch())
      .catch((error) => this.actions.actionFailed(error.json()));
  }
}

export default alt.createActions(PageActions);
