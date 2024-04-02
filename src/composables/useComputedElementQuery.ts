import { ref, readonly, unref, UnwrapRef, Ref } from 'vue'
import { useMutationObserver } from '@vueuse/core'

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

    const elements = (root === 'document' ? document : root).querySelectorAll(selector)
    return Array.from(elements).filter(el => el instanceof HTMLElement) as Array<HTMLElement>
}

export function useComputedElementQuery<T>(getElement: () => T) {
    const element = ref<T>(getElement())

    useMutationObserver(
        () => document.body,
        () => { 
            const newValue = unref(getElement()) as UnwrapRef<T>
            if(newValue !== element.value) {
                element.value = newValue
            }
        },
        { subtree: true, childList: true, /* attributes: true */ }
    )

    return readonly(element)
}
