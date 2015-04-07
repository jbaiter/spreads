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
import {Navbar, CollapsableNav, Nav, NavItem, Badge, ModalTrigger} from "react-bootstrap";
import {NavItemLink} from "react-router-bootstrap";
import {RouteHandler, Link} from "react-router";
import ListenerMixin from "alt/mixins/ListenerMixin";

import Icon from "components/utility/Icon.jsx";
import AboutModal from "components/modals/AboutModal.jsx";
import ShutdownModal from "components/modals/ShutdownModal.jsx";
import appStateStore from "stores/AppStateStore.js";
import loggingStore from "stores/LoggingStore.js";

const {PropTypes} = React;

function getState() {
  let appState = appStateStore.getState();
  return {
    config: appState.config,
    version: appState.version,
    numUnreadErrors: loggingStore.getState().numUnreadErrors
  };
}

export default React.createClass({
  displayName: "App",
  mixins: [ListenerMixin],
  propTypes: {
    params: PropTypes.object,
    query: PropTypes.object
  },

  getInitialState: getState,

  componentDidMount() {
    this.listenToMany([appStateStore, loggingStore], this.onChange);
  },

  onChange() {
    this.setState(getState());
  },

  render() {
    return (
      <div>
        <Navbar brand={<Link to="home">spreads</Link>} toggleNavKey={0}>
          <CollapsableNav eventKey={0}>
          {this.state.config.web.mode !== "processor" &&
            <Nav navbar>
              <NavItemLink eventKey={1} to="new-workflow">
                <Icon name="plus" /> New Workflow
              </NavItemLink>
            </Nav>}
            <Nav navbar right>
              <NavItemLink eventKey={1} to="logging">
                <Icon name="list" /> Show Log
                {this.state.numUnreadErrors > 0 &&
                  <Badge className="num-unread">{this.state.numUnreadErrors}</Badge>}
              </NavItemLink>
              <NavItemLink eventKey={2} to="preferences">
                <Icon name="cog" /> Preferences
              </NavItemLink>
              <ModalTrigger modal={<AboutModal version={this.state.version} />}>
                <NavItem eventKey={3}>
                  <Icon name="info-circle" /> About
                </NavItem>
              </ModalTrigger>
              {this.state.config.web.standalone_device &&
                <ModalTrigger modal={<ShutdownModal />}>
                  <NavItem eventKey={4}>
                    <Icon name="power-off" /> Shut Down
                  </NavItem>
                </ModalTrigger>}
              </Nav>
            </CollapsableNav>
        </Navbar>
        <div className="container">
          <RouteHandler {...this.props} />
        </div>
      </div>
    );
  }
});
