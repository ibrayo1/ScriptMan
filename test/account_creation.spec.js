"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const account_js_1 = require("../public/js/account.js");
const chai_1 = require("chai");
require("mocha");
describe('Testing account creation', () => {
    it('creates a valid account', () => {
        const account1 = new account_js_1.Account(0, 0, 0, 0, 0);
        chai_1.expect(account1.playerId).to.equal(0);
        chai_1.expect(account1.rotation).to.equal(0);
        //expect(account1.team_color).to.equal('blue')
        chai_1.expect(account1.x).to.equal(0);
        chai_1.expect(account1.y).to.equal(0);
    });
});
