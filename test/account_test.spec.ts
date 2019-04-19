import { Account } from '../public/js/account'
import { expect } from 'chai'
import 'mocha'

describe('Create Account', () => {
    it('should create a valid account', () => {
        const account1 = new Account(1, 0, 0, 0, "blue")
        expect(account1.playerId).to.equal(1)
        expect(account1.x).to.equal(0)
        expect(account1.y).to.equal(0)
        expect(account1.rotation).to.equal(0)
        expect(account1.team_color).to.equal("blue")
    })
})