import {Address} from 'everscale-inpage-provider'

export type ListBet = Map<string, Bet>

export interface Beat {
    chose: string
    user: Address
}

export interface Bet {
    id: string
    amount: Number
    hash: string
    user: Address
    beat?: Beat | null
}
