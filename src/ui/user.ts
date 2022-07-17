import { behavior } from '../browser'
import { avatarsRender } from './util'

export function userRender(user: string, network = 'everscale') {
    let out = `${avatarsRender(user)}
<div class="card-body">
    <p><b>${network}:</b> <span>${user}</span></p>
</div>
<div class="card-body">
    <button type="button" class="btn btn-primary" data-behavior="disconnectAction">Disconnect</button>
</div>`
    behavior('user',elem => elem.innerHTML = out)
}
