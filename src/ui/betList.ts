import { behavior } from '../browser'
import { Bet, ListBet } from '../GameContract'
import { avatarsRender } from './util'

export function beatRender(value: Bet) {
    return `<div class="btn-group" role="group">
    <button
        data-behavior="action"
        data-name="beat"
        data-param='{"id":"${value.id}", "chose": "S"}'
        type="button"
        class="btn btn-secondary">S</button>
    <button
        data-behavior="action"
        data-name="beat"
        data-param='{"id":"${value.id}", "chose": "E"}' 
        type="button" class="btn btn-secondary">E</button>
    <button
        data-behavior="action"
        data-name="beat"
        data-param='{"id":"${value.id}", "chose": "W"}'
        type="button" class="btn btn-secondary">W</button>
    <button
        data-behavior="action"
        data-name="beat"
        data-param='{"id":"${value.id}", "chose": "R"}'
        type="button" class="btn btn-secondary">R</button>
</div>`
}

export function actionRender(currentUser: string, value: Bet) {
    const isOwner = value.user.toString() == currentUser
    if (value.beat && isOwner) {
        return redeemRender(value)
    } else if (!value.beat) {
        return beatRender(value)
    }
    return '<div class="alert alert-warning" role="alert">waiting</div>'
}

export function redeemRender(value: Bet) {
    return `<div class="btn-group" role="group">
    <button 
    data-behavior="action"
    data-name="redeem"
    data-param='{"id":"${value.id}", "hash": "${value.hash}"}'
    type="button" class="btn btn-secondary">redeem</button>
</div>`
}

export async function betListRender(currentUser: string, list: ListBet) {
    let out = ''
    list.forEach((value, key) => {
        out += `<div class="card" style="width: 18rem;">
                ${avatarsRender(value.hash, 'identicon')}
                <div class="card-body">
                    <h1 class="card-title">${value.amount.toFixed(0)}Ė</h1>
                    <div class="card">
                        <div class="d-flex flex-row">
                            <div class="p-2">${avatarsRender(value.user.toString())}</div>
                            <div class="p-2">${value.beat ? avatarsRender(value.beat.user.toString()): '<h1>?</h1>'}</div>
                        </div>
                    </div>
                    ${actionRender(currentUser, value)}
                </div>
            </div>`
    })
    behavior('betList',elem => elem.innerHTML = out)
}
