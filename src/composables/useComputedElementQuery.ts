import { ref, readonly, unref, UnwrapRef, Ref, watchEffect } from 'vue'
import { useBrowserLocation, useMutationObserver } from '@vueuse/core'
import { $ } from '../logic/querySelector'

// '.branch-action-item-icon svg[aria-hidden=true]'

export function useComputedElementQuery<T>(getElement: () => T) {
    const element = ref<T>(getElement())

    useMutationObserver(
        () => $('body > div[data-turbo-body]'),
        () => { 
            const newValue = unref(getElement()) as UnwrapRef<T>
            if(newValue !== element.value) {
                element.value = newValue
            }
        },
        { subtree: true, childList: true, attributes: true }
    )

    return readonly(element)
}
