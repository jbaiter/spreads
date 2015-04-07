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

import {makeUrl} from "utils/WebAPIUtils.js";
import alt from "alt";

class SystemActions {
  constructor() {
    this.generateActions("disconnected", "reconnected");
  }

  shutdown() {
    fetch(makeUrl("/api", "system", "shutdown"), {method: "post"});
  }

  reboot() {
    fetch(makeUrl("/api", "system", "reboot"), {method: "post"});
  }

  reset() {
    fetch(makeUrl("/api", "reset"), {method: "post"});
  }
}

export default alt.createActions(SystemActions);
