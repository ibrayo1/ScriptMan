"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This class is the basic "Account" class.
class Account {
    // Basic constructor. On account creation you only need two things:
    //      1: the username the account chooses
    //      2: the ID number the account will be assigned
    // The team color will be chosen later.
    constructor(id, x, y, rotation, val) {
        this.playerId = id;
        this.score = val;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
    }
}
exports.Account = Account;
