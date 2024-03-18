import { ref, readonly, unref, UnwrapRef } from 'vue'
import { useMutationObserver } from '@vueuse/core'

export function $(selector: string, root?: Element | null) {
    if(root === null) {
        return null
    }

    const element = (root ?? document).querySelector(selector)
    return element instanceof HTMLElement ? element : null
}

export function $$(selector: string, root?: Element | null) {
    if(root === null) {
        return []
    }

    const elements = (root ?? document).querySelectorAll(selector)
    return Array.from(elements).filter(el => el instanceof HTMLElement) as Array<HTMLElement>
}

export function useComputedElementQuery<T>(getElement: () => T) {
    const element = ref<T>(getElement())

    useMutationObserver(
        () => document.body,
        () => { element.value = unref(getElement()) as UnwrapRef<T> },
        { subtree: true, childList: true, attributes: true }
    )

    return readonly(element)
}
