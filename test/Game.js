const {expect} = require('chai')
const gameDeploy = require('../deploy/gameDeploy')
const walletTestDeploy = require('../deploy/walletTestDeploy')

const toNano = (amount) => locklift.utils.convertCrystal(amount, 'nano')
const toEver = (amount) => locklift.utils.convertCrystal(amount, 'ton')
const balance = async (contract) => {
  return toEver((await locklift.ton.getBalance(contract.address))).toNumber()
}

describe('Game', async function () {
  const contract = await locklift.factory.getContract('Game')
  let alice
  let bob
  let game
  const balances = async () => {
    return {
      game: await balance(game),
      alice: await balance(alice),
      bob: await balance(bob),
    }
  }
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
    console.log(await balances())
    // Alice -> Alice: <make> **chose (S|E|W)**
    const notice = 42
    const bet = await game.call({
      method: 'createHash', params: {
        nameOption: 'S',
        notice,
      }
    })
    console.log('bet', bet)
    const [keyPair] = await locklift.keys.getKeyPairs()
    // Alice -> Game: <bid> **sha256** of **chose+notice** (mint NFT)
    await alice.runTarget({
      contract: game,
      method: 'bet',
      params: {
        betHash: `0x${bet.toString(16)}`,
        amount: toNano(5),
      },
      value: toNano(6),
      keyPair,
    })
    console.log(await balances())
    // Bob <-> NFT: <list> **list NFT**
    let listBet = await game.call({method: 'listBet'})
    expect(Object.keys(listBet).length).to.be.equal(1)
    const betId = Object.keys(listBet)[0]
    console.log(listBet[betId])
    expect(listBet[betId].beat).to.be.null
    // Bob <-> Game: <beat> **chose (S|E|W)**
    await bob.runTarget({
      contract: game,
      method: 'beat',
      params: {betId, chose: 'E'},
      value: toNano(7),
      keyPair,
    })
    console.log(await balances())
    // Alice <-> Game: <get> **status game**
    listBet = await game.call({method: 'listBet'})
    expect(listBet[betId].beat).to.be.not.null
    // Alice -> Game: <send> **chose+notice** (end game)
    await alice.runTarget({
      contract: game,
      method: 'redeem',
      params: {
        betId,
        betChose: 'S',
        notice,
      },
      keyPair,
    })
    console.log(await balances())
    listBet = await game.call({method: 'listBet'})
    console.log(await game.call({method: 'listBet'}))
    expect(Object.keys(listBet).length).to.be.equal(0)
  })
})
