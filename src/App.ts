import {Address, ProviderRpcClient, Subscription,} from 'everscale-inpage-provider'
import * as bootstrap from 'bootstrap'
// @ts-ignore
import detectEthereumProvider from '@metamask/detect-provider'
//import {EverscaleStandaloneClient} from 'everscale-standalone-client'
// import {BigNumber} from 'bignumber.js'

import abi from '../build/Game.abi'
import addr from '../build/Game.addr'
import {
    behavior,
    innerText,
} from './util'


interface ProviderList {
    ethereum: null
    everscale: ProviderRpcClient | null
}

const provider: ProviderList = {
    ethereum: null,
    everscale: null,
}

// async function timestampAction() {
//     const contract = await Contract()
//     try {
//         const out = await contract.methods.timestamp({}).call()
//         behavior('out', innerText(out.timestamp))
//     } catch (error) {
//         console.error(error)
//     }
// }
//
// async function renderHelloWorldAction() {
//     const contract = await Contract()
//     try {
//         const out = await contract.methods.renderHelloWorld({}).call()
//         behavior('out', innerText(out.value0))
//     } catch (error) {
//         console.error(error)
//     }
// }

// async function touchAction() {
//     const contract = await Contract()
//     const providerState = await ever.getProviderState()
//     const publicKey = providerState.permissions.accountInteraction.publicKey
//     console.error(`touchAction publicKey=${publicKey}`)
//     try {
//         const response = await contract.methods.touch({}).sendExternal({
//             publicKey,
//             withoutSignature: true,
//         })
//         console.log(response)
//         const trx = response.transaction
//         const out = `aborted=${trx.aborted} <a href="${await explorerTransactionDetails(trx.id.hash)}">trx=${trx.id.hash}</a>`
//         behavior('out',elem => elem.innerHTML = out)
//     } catch (error) {
//         console.error(error)
//     }
// }

// async function explorerTransactionDetails(hash: string) {
//     const providerState = await ever.getProviderState()
//     switch (providerState.selectedConnection) {
//         case 'mainnet':
//             return `https://ever.live/transactions/transactionDetails?id=${hash}`
//         case 'testnet':
//             return `https://net.ever.live/transactions/transactionDetails?id=${hash}`
//         case 'localnet':
//             return `http://localhost/transactions/transactionDetails?id=${hash}`
//         default:
//             return `#${hash}`
//     }
// }

function loginModalHide() {
    const loginModal = document.getElementById('loginModal')
    const modal = bootstrap.Modal.getInstance(loginModal)
    modal.hide()
}

async function connectMetaMask() {
    loginModalHide()
    await provider.ethereum.request({ method: 'eth_requestAccounts' })

// The MetaMask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...
    //const signer = provider.getSigner()
}
function connectEverWallet() {
    if (!provider.everscale) {
        throw new Error('connectEverWallet')
    }
    provider.everscale.requestPermissions({
        permissions: [
            'basic',
            'accountInteraction',
        ],
    }).then(value => {
        loginModalHide()
        console.log(value)
    }).catch(reason => {
        console.log(reason)
    })
}

async function disconnectAction() {
    console.log('disconnectAction')
    await provider.everscale.disconnect()
}

async function checkConnect() {
    if (!provider.everscale) {
        return
    }
    const providerState = await provider.everscale.getProviderState()
    const permissions = providerState.permissions
    const network = providerState.selectedConnection
    if (!contractAddress(network) || !permissions.accountInteraction) {
        behavior('connectEverWallet', elem => elem.onclick = connectEverWallet)
        behavior('connectMetaMask', elem => elem.onclick = connectMetaMask)
        switchScreen('login')
        const connectText = elem => {
            const disabled = !contractAddress(network)
            if ('disabled' in elem) elem.disabled = disabled
            //elem.innerText = disabled ? `Contract not deployed into ${network}` : `Connect with ${network} for interact contract`
        }
        behavior('connect', connectText)
    } else {
        // INFO for transactionsFound and contractStateChanged need permissions
        const providerState = await provider.everscale.getProviderState()
        (await provider.everscale.subscribe('transactionsFound', {
            address: contractAddress(providerState.selectedConnection),
        })).on('data', (event) => {
            console.log(':', {
                address: event.address,
                transactions: event.transactions,
                info: event.info,
            })
        })
        (await provider.everscale.subscribe('contractStateChanged', {
            address: contractAddress(providerState.selectedConnection),
        })).on('data', (event) => {
            console.log('permissionsChanged:', {
                address: event.address,
                state: event.state,
            })
        })
        switchScreen('main')
        const account = permissions.accountInteraction
        behavior('address', innerText(account.address.toString()))
        behavior('publicKey', innerText(account.publicKey.toString()))
        // behavior('timestampAction', elem => elem.onclick = timestampAction)
        // behavior('renderHelloWorldAction', elem => elem.onclick = renderHelloWorldAction)
        // behavior('touchAction', elem => elem.onclick = touchAction)
        behavior('disconnectAction', elem => elem.onclick = disconnectAction)
    }
}
async function setNetworkChanged(network: string) {
    const mod = network === 'mainnet' ? 'success' : 'secondary'
    const out = `<span class="badge bg-${mod}">${network}</span>`
    behavior('network',elem => elem.innerHTML = out)
    await checkConnect()
}

function contractAddress(network: string, name = 'Game'): Address | null {
    if (addr[network] && addr[network][name]) {
        return new Address(addr[network][name])
    }
    return null
}

async function Contract() {
    const providerState = await provider.everscale.getProviderState()
    const address = contractAddress(providerState.selectedConnection)
    return new provider.everscale.Contract(abi, address)
}

function switchScreen(to: string) {
    [
        'extension',
        'login',
        'main',
    ].forEach(screen => {
        const switcher = elem => elem.style.display = (to === screen ? 'block' : 'none')
        behavior(screen, switcher)
    })
}

async function subscribe() {
    await subscribeEverscale()
    await subscribeEthereum()
}

async function subscribeEthereum() {
    if (!provider.ethereum) {
        return
    }
    provider.ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log(accounts);
    })
    provider.ethereum.on('chainChanged', (chainId: number) => {
        console.log(chainId);
    })
    provider.ethereum.on('disconnect', (code: number, reason: string) => {
        console.log(code, reason);
    })
}
async function subscribeEverscale() {
    if (!provider.everscale) {
        return
    }
    provider.everscale.subscribe('networkChanged').then(subscription => {
        subscription.on('data', event => {
            console.log('networkChanged:', event)
            setNetworkChanged(event.selectedConnection)
        })
    })
    provider.everscale.subscribe('permissionsChanged').then(subscription => {
        subscription.on('data', async (event) => {
            console.log('permissionsChanged:', event.permissions)
            await checkConnect()
        })
    })
}

async function mainFlow() {
    const providerState = await provider.everscale.getProviderState()
    await setNetworkChanged(providerState.selectedConnection)
    await subscribe()
}

async function detectProvider() {
    const ethereum = await detectEthereumProvider()
    if (provider) {
        provider.ethereum = ethereum
    } else {
        console.log('Please install MetaMask!')
    }
    const ever = new ProviderRpcClient({
        // fallback: () => EverscaleStandaloneClient.create({
        //     connection: 'mainnet',
        // }),
    })
    if ((await ever.hasProvider())) {
        try {
            await ever.ensureInitialized()
            provider.everscale = ever
        } catch (error) {
            throw error // TODO handle it
        }
    } else {
        console.log('Please install Ever Wallet!')
    }
}

async function App() {
    await detectProvider()
    console.log(provider)
    await mainFlow()
}

App().catch((error) => console.error(error))
