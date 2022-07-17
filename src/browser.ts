export function behavior(name: string, fn: (elem: HTMLElement | HTMLButtonElement | HTMLInputElement) => void) {
    document.querySelectorAll(`[data-behavior=${name}]`).forEach(fn)
}

export const innerText = (text: string) => (elem: HTMLElement | HTMLButtonElement) => {
    elem.innerText = text
}

export function action(list) {
    behavior('action', elem => elem.onclick = (event) => {
        console.trace('behavior:action', elem)
        if (event.target instanceof Element) {
            const name = event.target.getAttribute('data-name')
            if (!(typeof list[name] == 'function')) {
                return
            }
            console.trace('behavior:action name', name)
            const paramData = event.target.getAttribute('data-param')
            console.trace('behavior:action param', paramData)
            try {
                return list[name](JSON.parse(paramData))
            } catch (error) {
                console.trace('behavior:action param error', error.message)
            }
            return list[name]()
        }
    })
}
