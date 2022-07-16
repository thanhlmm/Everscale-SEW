async function walletTestDeploy(locklift, _randomNonce = 0) {
  const Account = await locklift.factory.getAccount('test/WalletTest');
  const [keyPair] = await locklift.keys.getKeyPairs()
  return await locklift.giver.deployContract({
    contract: Account,
    constructorParams: {},
    initParams: {
      _randomNonce,
    },
    keyPair,
  }, locklift.utils.convertCrystal('100.014554001', 'nano'))
}

module.exports = walletTestDeploy;
