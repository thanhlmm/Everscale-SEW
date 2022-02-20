const {expect} = require('chai')
const gameDeploy = require('../deploy/gameDeploy')
const walletTestDeploy = require('../deploy/walletTestDeploy')

const balance = async (contract) => {
  return locklift.utils.convertCrystal((await locklift.ton.getBalance(contract.address)), 'ton').toNumber().toFixed(4);
}

describe('Game', async function () {
  const contract = await locklift.factory.getContract('Game')
  let alice
  let bob
  let game
  it('Game::artifact', async function () {
    expect(contract.code).not.to.equal(undefined, 'Code should be available')
    expect(contract.abi).not.to.equal(undefined, 'ABI should be available')
  })

  it('Game::deploy', async function () {
    this.timeout(10000)
    game = await gameDeploy(locklift)
    expect(game.address).to.be.a('string')
      .and.satisfy(s => s.startsWith('0:'), 'Bad future address')
  })

  it('Game::changeRake', async function () {
    const [keyPair] = await locklift.keys.getKeyPairs()
    await game.run({
      method: 'changeRake',
      params: {value: 111},
      keyPair,
    })

    const response = await game.call({
      method: 'rake',
      params: {},
    })

    expect(response.toNumber()).to.be.equal(111, 'Wrong rake')
  })

  it('Game::createBet', async function () {
    // bad
    try {
      await game.call({
        method: 'createBet', params: {chose: "X"}
      })
      expect(false).to.be.equal(true)
    } catch (e) {
      expect(e.data.exit_code).to.be.equal(404)
    }
    // ok
    const response = await game.call({
      method: 'createBet', params: {chose: "S"}
    })
    expect(response.hash).to.not.empty
    expect(response.notice).to.not.empty
  })

  it('Game::wallets', async function () {
    this.timeout(10000)
    alice = await walletTestDeploy(locklift)
    expect(alice.address).to.be.a('string')
      .and.satisfy(s => s.startsWith('0:'), 'Bad future address')
    bob = await walletTestDeploy(locklift)
    expect(bob.address).to.be.a('string')
      .and.satisfy(s => s.startsWith('0:'), 'Bad future address')
  })

  it('Game::gamePlay bob win', async function () {
    this.timeout(10000)
    console.log('game=', await balance(game))
    console.log('alice=', await balance(alice))
    console.log('bob=', await balance(bob))
    // Alice -> Alice: <make> **chose (S|E|W)**
    const bet = await game.call({
      method: 'createBet', params: {chose: "S"}
    })
    const [keyPair] = await locklift.keys.getKeyPairs()
    // Alice -> Game: <bid> **sha256** of **chose+notice** (mint NFT)
    await alice.runTarget({
      contract: game,
      method: 'bet',
      params: {
        betHash: `0x${bet.hash.toString(16)}`,
      },
      value: locklift.utils.convertCrystal(10, 'nano'),
      keyPair,
    })
    // Bob <-> NFT: <list> **list NFT**
    const listBet = await game.call({method: 'listBet'})
    const betId = Object.keys(listBet)[0]
    console.log(listBet[betId])
    // Bob <-> Game: <beat> **chose (S|E|W)**
    await bob.runTarget({
      contract: game,
      method: 'beat',
      params: {betId, chose: 'E'},
      value: locklift.utils.convertCrystal(10.1, 'nano'), // FIXME
      keyPair,
    })
    // Alice <-> Game: <get> **status game**
    console.log((await game.call({method: 'listBet'}))[betId])
    console.log('game=', await balance(game))
    console.log('alice=', await balance(alice))
    console.log('bob=', await balance(bob))
    // Alice -> Game: <send> **chose+notice** (end game)
    await alice.runTarget({
      contract: game,
      method: 'redeem',
      params: {betId, betChose: 'S', notice: `0x${bet.notice.toString(16)}`},
      keyPair,
    })
    console.log(await game.call({method: 'listBet'}))
    console.log('game=', await balance(game))
    console.log('alice=', await balance(alice))
    console.log('bob=', await balance(bob))
  })
})
