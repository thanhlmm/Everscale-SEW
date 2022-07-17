export function behavior(name: string, fn: (elem: HTMLElement | HTMLButtonElement | HTMLInputElement) => void) {
    document.querySelectorAll(`[data-behavior=${name}]`).forEach(fn)
}

export const innerText = (text: string) => (elem: HTMLElement | HTMLButtonElement) => {
    elem.innerText = text
}

export function action(list) {
    behavior('action', elem => elem.onclick = (event) => {
        if (event.target instanceof Element) {
            const name = event.target.getAttribute('data-name')
            if (!(typeof list[name] == 'function')) {
                return
            }
            const paramData = event.target.getAttribute('data-param')
            try {
                return list[name](JSON.parse(paramData))
            } catch (error) {
                console.trace('behavior:action param error', error.message)
            }
            return list[name]()
        }
    })
}

export function setDataVault(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value))
}

export function getDataVault<T>(key: string): T | null {
    const item = localStorage.getItem(key)
    if (item) {
        return JSON.parse(localStorage.getItem(key)) as T
    }
    return null
}
