"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Record {
    constructor(id, patientId, data) {
        this.id = id;
        this.patientId = patientId;
        this.data = data;
        this.timestamp = new Date();
    }
    validate() {
        // Add validation logic for the record data
        if (!this.id || !this.patientId || !this.data) {
            return false;
        }
        return true;
    }
    format() {
        // Format the record data for storage or transmission
        return {
            id: this.id,
            patientId: this.patientId,
            data: this.data,
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.default = Record;
