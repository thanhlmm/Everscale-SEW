import {
    Address,
    Contract,
} from 'everscale-inpage-provider'
// @ts-ignore
import detectEthereumProvider from '@metamask/detect-provider'
import { BigNumber } from 'bignumber.js'
import { randomBytes } from 'crypto'
import GameABI from '../build/Game.abi'
import GameAddress from '../build/Game.addr'
import {
    behavior,
    action,
    innerText,
    getDataVault,
    setDataVault,
} from './browser'
import {
    detectProvider,
    ProviderList,
    selectedConnection,
} from './blockchain'
import {
    userRender,
    betListRender,
    loginModalHide,
} from './ui'
import {
    Bet,
    ListBet,
} from './GameContract'
import {
    NotValidParamError
} from "./AppError";

let provider: ProviderList = {
    ethereum: null,
    everscale: null,
}

let GameContract: Contract<typeof GameABI>

async function bet(nameOption: string): Promise<void> {
    const contract = await gameContract()
    const selected = await selectedConnection('everscale', provider)
    const selectedAddress = new Address(selected.address)
    await contract.methods.bet({
        betHash: await createHash(nameOption),
        amount: '14000000000'
    }).send({
        from: selectedAddress,
        amount: '15000000000',
        bounce: true,
    })
}

async function beat(betId: string, chose: string): Promise<void> {
    const contract = await gameContract()
    const selected = await selectedConnection('everscale', provider)
    const selectedAddress = new Address(selected.address)
    await contract.methods.beat({
        betId,
        chose,
    }).send({
        from: selectedAddress,
        amount: '15000000000',
        bounce: true,
    })
}

async function redeem(betId: string, hash: string): Promise<void> {
    const contract = await gameContract()
    const selected = await selectedConnection('everscale', provider)
    const selectedAddress = new Address(selected.address)
    const data = getDataVault<CreateHashParam>(hash)
    if (!data && (!data.nameOption || !data.notice)) {
        throw new NotValidParamError(hash)
    }
    await contract.methods.redeem({
        betId: betId,
        // @ts-ignore
        notice: data.notice,
        // @ts-ignore
        betChose: data.nameOption,
    }).send({
        from: selectedAddress,
        amount: '1000000000',
        bounce: true,
    })
}

export interface CreateHashParam {
    notice: string
    nameOption: string
}

async function createHash(nameOption: string, notice?: string): Promise<string> {
    notice = notice ? notice : `0x${randomBytes(32).toString('hex')}`
    const contract = await gameContract()
    const param = {
        notice,
        nameOption
    }
    console.trace('createHash', param)
    const out = await contract.methods.createHash(param).call()
    setDataVault(out.hash, param);
    return out.hash
}

async function listBet(): Promise<ListBet> {
    const contract = await gameContract()
    const out = await contract.methods.listBet({}).call()
    const list = new Map<string, Bet>()
    out.listBet.forEach((it) => {
        list.set(it[0], {
            id: it[0],
            amount: new BigNumber(it[1].amount).shiftedBy(-9).toNumber(),
            user: it[1].user,
            hash: it[1].hash,
            beat: it[1].beat,
        })
    })
    return list
}

const actionList = {
    bet: async (param) => {
        await bet(param.chose)
    },
    beat: async (param) => {
        await beat(param.id, param.chose)
    },
    redeem: async (param) => {
        await redeem(param.id, param.hash)
    },
}

async function connectMetaMask() {
    loginModalHide()
    await provider.ethereum.request({ method: 'eth_requestAccounts' })
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
        switchScreen('main')
        const account = permissions.accountInteraction
        userRender(account.address.toString())
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
    if (GameAddress[network] && GameAddress[network][name]) {
        return new Address(GameAddress[network][name])
    }
    return null
}

async function gameContract(): Promise<Contract<typeof GameABI>> {
    if (GameContract) {
        return GameContract
    }
    const providerState = await provider.everscale.getProviderState()
    const address = contractAddress(providerState.selectedConnection)
    GameContract = new provider.everscale.Contract(GameABI, address)
    GameContract.waitForEvent().then(value => {
        console.log(value)
    })
    return GameContract
}

function switchScreen(to: string) {
    [
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

async function App() {
    provider = await detectProvider()
    console.log(provider)
    await mainFlow()
    await betListRender(await listBet())
    action(actionList)
}

// class NApp {
//     constructor(readonly provider: ProviderList) {
//     }
//
//     async run() {
//         const app = new NApp(await detectProvider())
//         return app.mainFlow()
//     }
//
//     async mainFlow() {
//         const providerState = await provider.everscale.getProviderState()
//         await setNetworkChanged(providerState.selectedConnection)
//         await subscribe()
//     }
// }

App().catch((error) => console.error(error))
