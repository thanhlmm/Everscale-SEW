export function behavior(name: string, fn: (elem: HTMLElement | HTMLButtonElement | HTMLInputElement) => void) {
    document.querySelectorAll(`[data-behavior=${name}]`).forEach(fn)
}

export const innerText = (text: string) => (elem: HTMLElement | HTMLButtonElement) => {
    elem.innerText = text
}
