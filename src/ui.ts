import {Modal} from 'bootstrap'

export function loginModalHide() {
    const loginModal = document.getElementById('loginModal')
    const modal = Modal.getInstance(loginModal)
    modal.hide()
}
