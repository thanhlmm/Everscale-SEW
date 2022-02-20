const {expect} = require('chai')

describe('Util', async function () {
  const contract = await locklift.factory.getContract('UtilTest')
  let util

  it('Util::deploy', async function () {
    this.timeout(10000)
    const [keyPair] = await locklift.keys.getKeyPairs()
    util = await locklift.giver.deployContract({
      contract,
      keyPair,
    })
    expect(util.address).to.be.a('string')
      .and.satisfy(s => s.startsWith('0:'), 'Bad future address')
  })

  it('Util::percentage', async function () {
    const cases = [
      [1, 1, 0.00001], // 0.001%
      [1, 500, 0.005], // 0.5%
      [1, 1000, 0.01], // 1%
      [0.5, 49000, 0.245], // 49%
      [1, 100000, 1], // 100%
      [1, 200000, 2], // 200%
    ]
    for (const item of cases) {
      const response = await util.call({
        method: 'percentage', params: {
          amount: locklift.utils.convertCrystal(item[0], 'nano'),
          permille: item[1]
        },
      })
      expect(response.toString()).to.be.equal(
        locklift.utils.convertCrystal(item[2], 'nano'),
        `${Number(item[1] / 1000).toFixed(3)}% of ${item[0]} EVER in nano`
      )
    }
  })
})
