"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const account_1 = require("../public/js/account");
const chai_1 = require("chai");
require("mocha");
describe('Create Account', () => {
    it('should create a valid account', () => {
        const account1 = new account_1.Account(1, 0, 0, 0, "blue");
        chai_1.expect(account1.playerId).to.equal(1);
        chai_1.expect(account1.x).to.equal(0);
        chai_1.expect(account1.y).to.equal(0);
        chai_1.expect(account1.rotation).to.equal(0);
        chai_1.expect(account1.team_color).to.equal("blue");
    });
});
