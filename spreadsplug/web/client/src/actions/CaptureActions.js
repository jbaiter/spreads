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

import alt from "alt";
import {makeUrl, makeParams, fetchJson} from "utils/WebAPIUtils.js";

class CaptureActions {
  constructor() {
    this.generateActions("prepared", "triggered", "succeeded", "failed", "finished");
  }

  prepare({workflowId, reset}) {
    this.dispatch();
    fetchJson(
      makeUrl("/api/workflow", workflowId,
              "prepare_capture" + makeParams({reset: reset})),
      {method: "post"})
      .then(() => this.actions.prepared)
      .catch((error) => this.actions.failed(error));
  }

  trigger({workflowId, retake}) {
    fetchJson(
      makeUrl("/api/workflow", workflowId,
              "capture" + makeParams({retake: retake})),
      {method: "post"})
      .catch((error) => this.actions.failed(error));
  }

  finish({workflowId}) {
    fetchJson(makeUrl(
      "/api/workflow", workflowId, "finish_capture"),
      {method: "post"})
      .then(() => this.actions.finished)
      .catch((error) => this.actions.failed(error));
  }
}

export default alt.createActions(CaptureActions);
