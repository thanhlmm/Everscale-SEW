async function walletTestDeploy(locklift) {
  const Account = await locklift.factory.getAccount('WalletTest');
  const [keyPair] = await locklift.keys.getKeyPairs()
  return await locklift.giver.deployContract({
    contract: Account,
    constructorParams: {},
    initParams: {
      _randomNonce: Math.random() * 6400 | 0,
    },
    keyPair,
  }, locklift.utils.convertCrystal('100.014554001', 'nano'))
}

module.exports = walletTestDeploy;
