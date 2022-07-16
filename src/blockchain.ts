import { ProviderRpcClient } from "everscale-inpage-provider";
import {ConnectionNotSelectedError} from "./AppError";

export interface ProviderList {
    ethereum: unknown | null
    everscale: ProviderRpcClient | null
}

export interface Chain {
    chainName: string
}

export interface ConnectionChain extends Chain {
    network: string
    address: string
    publicKey: string
}

export interface ProviderState {
    [key: string]: ConnectionChain
}

export interface Transaction extends Chain {
    id: string
}

export async function selectedConnectionList(list?: ProviderList): Promise<ProviderState> {
    list = list ? list : (global.provider ? global.provider : {} as ProviderList)
    const state: ProviderState = {}
    if (list.everscale) {
        const providerState = await list.everscale.getProviderState()
        const accountInteraction = providerState.permissions.accountInteraction
        state['everscale'] = {
            chainName: 'everscale',
            network: providerState.selectedConnection,
            address: accountInteraction.address.toString(),
            publicKey: accountInteraction.publicKey,
        }
    }
    return state
}

export async function selectedConnection(
    chainName: string,
    list?: ProviderList
): Promise<ConnectionChain> {
    const selected = await selectedConnectionList(list)
    console.log(selected)
    if (!selected[chainName]) {
        throw new ConnectionNotSelectedError
    }
    return  selected[chainName]
}

export async function explorerTransactionDetails(trx: Transaction) {
    const selected = await selectedConnection(trx.chainName)
    const trxKey = `${selected.chainName}:${selected.network}`
    switch (trxKey) {
        case 'everscale:mainnet':
            return `https://ever.live/transactions/transactionDetails?id=${trx.id}`
        case 'everscale:testnet':
            return `https://net.ever.live/transactions/transactionDetails?id=${trx.id}`
        case 'everscale:fld':
            return `https://fld.ever.live/transactions/transactionDetails?id=${trx.id}`
        case 'everscale:rfld':
            return `https://fld.ever.live/transactions/transactionDetails?id=${trx.id}`
        case 'gosh:mainnet':
            return `https://gosh.live/transactions/transactionDetails?id=${trx.id}`
        case 'everscale:localnet':
            return `http://localhost/transactions/transactionDetails?id=${trx.id}`
        default:
            return `${trxKey}#${trx.id}`
    }
}
