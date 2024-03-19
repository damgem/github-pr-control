import { computed } from 'vue'
import { useComputedElementQuery, $, $$ } from '../composables/useComputedElementQuery'

const ACTION_IGNORE_LIST = [
    'All checks have passed',
    'This branch has not been deployed',
    'Some checks haven\u2019t completed yet',
    'Review required',
]

const DEFINED_STATES = ['success', 'problem', 'error'] as const
const STATES = [...DEFINED_STATES, 'unknown'] as const

function processActionItems(actionItems: HTMLElement[]) {
    function getAction(item: HTMLElement) {
        return $('.status-heading', item)?.innerText ?? 'unknown-action'
    }
    
    function getState(item: HTMLElement): typeof STATES[number] {
        const indicatorClassList = $('.completeness-indicator', item)?.classList ?? []

        const indicatorStateSuffixes = Array.from(indicatorClassList)
            .filter(cname => cname.startsWith('completeness-indicator-'))
            .map(cname => cname.replace('completeness-indicator-', ''))

        const state = indicatorStateSuffixes.length !== 1 ? indicatorStateSuffixes[0] : undefined

        if(!state || !DEFINED_STATES.includes(state as any)) {
            return 'unknown'
        }

        return state as typeof DEFINED_STATES[number]
    }

    return actionItems
        .map(item => ({ action: getAction(item), state: getState(item) }))
        .filter(({ action }) => !ACTION_IGNORE_LIST.includes(action))
}

export function usePRDetails() {
    const checkboxElements = useComputedElementQuery(() => $$('input[type="checkbox"].task-list-item-checkbox:not(:checked)'))
    const unaddressedTasks = computed(() => checkboxElements.value.map(cb => cb.parentElement?.innerText.split('\n')[0].trim()))

    const issueLinkElement = useComputedElementQuery(() => $('.issue-link'))

    const linkedIssue = computed(() => {
        const el = issueLinkElement.value

        if(!el) { return undefined }
        
        return {
            issueNumber: el.innerText.replace('#', ''),
            href: el.getAttribute('href')
        }
    })

    const status = useComputedElementQuery(() => $('.State')?.title.toLowerCase().replace('status: ', ''))

    const hasPreviewLabel = useComputedElementQuery(() => !!$('.discussion-sidebar-item .IssueLabel[data-name="preview"]'))

    const actions = useComputedElementQuery(() => processActionItems($$('.branch-action-item')))

    return {
        unaddressedTasks,
        status,
        linkedIssue,
        hasPreviewLabel,
        actions
    }
}
