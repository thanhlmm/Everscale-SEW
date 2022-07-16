const chai = require('chai')
const deepEqualInAnyOrder = require('deep-equal-in-any-order')
chai.use(deepEqualInAnyOrder)
const { expect } = chai

const gameDeploy = require('../deploy/gameDeploy')
const walletTestDeploy = require('../deploy/walletTestDeploy')

const toNano = (amount) => locklift.utils.convertCrystal(amount, 'nano')
const toEver = (amount) => locklift.utils.convertCrystal(amount, 'ton')
const balance = async (contract, fractionDigits) => {
  return toEver((await locklift.ton.getBalance(contract.address))).toNumber().toFixed(fractionDigits)
}

describe('Game', async function () {
  const contract = await locklift.factory.getContract('Game')
  let alice
  let aliceAddress = '0:38aef7169789d2dd39598bcdc54e3f13adc4848bf4dc46c1d888b9727ad21405'
  let bob
  let bobAddress = '0:51a30d70e76a509dba6227416aaaf0cc86f06ccadc0dc49177898b293f14a822'
  let game
  let s42Hash = '0x90158cc534e3010661105d3792c895867f4a3d5f17fbd6fc735c088bc1dcf985'
  const balances = async (fractionDigits = 0) => {
    return {
      game: await balance(game, fractionDigits),
      alice: await balance(alice, fractionDigits),
      bob: await balance(bob, fractionDigits),
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
    alice = await walletTestDeploy(locklift, 0)
    expect(alice.address).to.be.a('string')
      .and.equal(aliceAddress)
    bob = await walletTestDeploy(locklift, 1)
    expect(bob.address).to.be.a('string')
      .and.equal(bobAddress)
  })

  it('Game::gamePlay bob win', async function () {
    this.timeout(10000)
    expect(await balances()).to.deep.equalInAnyOrder({
      game: '10',
      alice: '100',
      bob: '100',
    })
    // Alice -> Alice: <make> **chose (S|E|W)**
    const notice = 42
    const bet = await game.call({
      method: 'createHash', params: {
        nameOption: 'S',
        notice,
      }
    })
    const betHash = `0x${bet.toString(16)}`
    expect(betHash).to.be.equal(s42Hash)
    const [keyPair] = await locklift.keys.getKeyPairs()
    // Alice -> Game: <bid> **sha256** of **chose+notice** (mint NFT)
    await alice.runTarget({
      contract: game,
      method: 'bet',
      params: {
        betHash,
        amount: toNano(5),
      },
      value: toNano(6),
      keyPair,
    })
    expect(await balances()).to.deep.equalInAnyOrder({
      game: '15',
      alice: '95',
      bob: '100',
    })

    // Bob <-> NFT: <list> **list NFT**
    let listBet = await game.call({method: 'listBet'})
    expect(Object.keys(listBet).length).to.be.equal(1)
    const betId = Object.keys(listBet)[0]
    expect(listBet[betId]).to.deep.equalInAnyOrder({
        user: aliceAddress,
        hash: s42Hash,
        amount: '5000000000',
        beat: null
      }
    )
    expect(listBet[betId].beat).to.be.null
    // Bob <-> Game: <beat> **chose (S|E|W)**
    await bob.runTarget({
      contract: game,
      method: 'beat',
      params: {betId, chose: 'E'},
      value: toNano(7),
      keyPair,
    })
    expect(await balances()).to.deep.equalInAnyOrder({
      game: '20',
      alice: '95',
      bob: '95',
    })

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
    expect(await balances()).to.deep.equalInAnyOrder({
      game: '10',
      alice: '95',
      bob: '105',
    })
    listBet = await game.call({method: 'listBet'})
    expect(Object.keys(listBet).length).to.be.equal(0)
  })
})
