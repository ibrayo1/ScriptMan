import { Account } from '../public/js/account.js'
import {expect} from 'chai'
import 'mocha'

describe('Testing account creation', () => {
    it('creates a valid account', () =>{
        const account1 = new Account(0,0,0,0,0)
        expect(account1.playerId).to.equal(0)
        expect(account1.rotation).to.equal(0)
        //expect(account1.team_color).to.equal('blue')
        expect(account1.x).to.equal(0)
        expect(account1.y).to.equal(0)
    })
})