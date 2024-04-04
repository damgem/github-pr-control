type RootElement = Element | undefined | 'document'

export function $(selector: string, root: RootElement = 'document') {
    if(root === undefined) {
        return undefined
    }

    const element = (root === 'document' ? document : root).querySelector(selector)
    return element instanceof HTMLElement ? element : undefined
}

export function $$(selector: string, root: RootElement = 'document') {
    if(root === undefined) {
        return []
    }

    const rootElement = root === 'document' ? document : root
    const elements = rootElement.querySelectorAll(selector)
    return Array.from(elements).filter((el): el is HTMLElement => el instanceof HTMLElement)
}
