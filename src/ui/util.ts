import {behavior} from "../browser";

export function dicebear(data: string, algorithm = 'pixel-art') {
    return `https://avatars.dicebear.com/api/${algorithm}/${data}.svg`
}

export function avatarsRender(user: string, algorithm = 'pixel-art') {
    return `<img class="card-img-top" alt="${user}" src="${dicebear(user, algorithm)}">`
}

import * as bootstrap from 'bootstrap'
import {ConnectionData, NETWORK_PRESETS} from "everscale-standalone-client/dist/connectionController";

export function loginModalHide() {
    const loginModal = document.getElementById('loginModal')
    const modal = bootstrap.Modal.getInstance(loginModal)
    modal.hide()
}

export declare const ItemScreen: {
    readonly login: string
    readonly main: string
}

export declare type Screen = (keyof typeof ItemScreen)

export function switchScreen(to: Screen) {
    [
        'login',
        'main',
    ].forEach(screen => {
        const switcher = elem => elem.style.display = (to === screen ? 'block' : 'none')
        behavior(screen, switcher)
    })
}
