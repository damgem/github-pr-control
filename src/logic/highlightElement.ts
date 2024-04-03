import { GM_addStyle } from "$"

export function highlightScrollTo(element: Element | null | undefined) {    
    if(!element) return

    element.classList.add('scroll-highlight')
    element.scrollIntoView({ behavior: 'smooth' })

    setTimeout(() => { element.classList.remove('scroll-highlight') }, 1000)
}

GM_addStyle(`
    .scroll-highlight {
        scroll-margin-top: calc(60px + 16px);
        border: 1px solid #fde047 !important;
        box-sizing: border-box;
        transition: border-color 1s ease, border-width 1s ease, padding 1s ease;
    }
`)
