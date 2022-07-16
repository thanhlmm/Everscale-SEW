export function behavior(name: string, fn: (elem: HTMLElement | HTMLButtonElement | HTMLInputElement) => void) {
    document.querySelectorAll(`[data-behavior=${name}]`).forEach(fn)
}

export const innerText = (text: string) => (elem: HTMLElement | HTMLButtonElement) => {
    elem.innerText = text
}

export function action(list) {
    behavior('action', elem => elem.onclick = (event) => {
        try {
            const name = event.target.dataset.name
            if (typeof list[name] == 'function') {
                list[name]()
            }
        } catch (error) {
            console.log('action', error)
        }
    })
}
