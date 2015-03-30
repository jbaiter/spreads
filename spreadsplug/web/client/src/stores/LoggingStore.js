import alt from "../alt";
import LoggingActions from "../actions/LoggingActions.js";

class LoggingStore {
  constructor() {
    this.records = {};
    this.numUnreadErrors = 0;

    this.bindListeners({
      handleNew: LoggingActions.NEW_RECORD,
      handleMarkAllErrorsRead: LoggingActions.MARK_ALL_ERRORS_READ
    });
  }

  handleNew(record) {
    this.records.push(record);
    if (record.level === "error") {
      this.numUnreadErrors += 1;
    }
  }

  handleMarkAllErrorsRead() {
    this.numUnreadErrors = 0;
  }
}

export default alt.createStore(LoggingStore, "LoggingStore");
