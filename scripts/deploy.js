const gameDeploy = require('../deploy/gameDeploy')

async function main() {
  const instance = await gameDeploy(locklift)
  console.log(`Game deployed at: ${instance.address}`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.log(error)
    process.exit(1)
  })
