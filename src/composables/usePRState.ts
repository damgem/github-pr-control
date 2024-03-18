import { computed } from 'vue'
import { useComputedElementQuery, $, $$ } from '../composables/useComputedElementQuery'

import { reverseObject, createObjectFromKeysAndValues } from '../objectHelpers'

const ACTIONS_TO_FILTER = {
    'success': [ 'All checks have passed' ],
    'undefined-state': [ 'This branch has not been deployed', 'Some checks haven\u2019t completed yet' ],
    'error': [ 'Review required' ],
}

function getStateActions(actionItems: HTMLElement[]) {
    const actions = actionItems.map(item => $('.status-heading', item)?.innerText ?? 'unknown-action')
    const states = actionItems.map(item => {
        const indicatorClassList = $('.completeness-indicator', item)?.classList ?? []

        const indicatorStateSuffixes = Array.from(indicatorClassList)
            .filter(cname => cname.startsWith('completeness-indicator-'))
            .map(cname => cname.replace('completeness-indicator-', ''))

        return indicatorStateSuffixes.length === 1 ? indicatorStateSuffixes[0] : 'undefined-state'
    })

    const actionStates = createObjectFromKeysAndValues(actions, states)
    const stateActions = reverseObject(actionStates)

    return stateActions
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

    const unfilteredStateActions = useComputedElementQuery(() => getStateActions($$('.branch-action-item')))

    const stateActions = computed(() => {
        const stac = { ...unfilteredStateActions.value }

        for(const [state, actionsToFilter] of Object.entries(ACTIONS_TO_FILTER)) {
            if(!stac[state]) continue

            stac[state] = stac[state]?.filter(msg => !actionsToFilter.includes(String(msg)))
            
            if(stac[state]!.length === 0) {
                delete stac[state]
            }
        }

        return stac
    })

    return {
        unaddressedTasks,
        status,
        linkedIssue,
        hasPreviewLabel,
        stateActions
    }
}
