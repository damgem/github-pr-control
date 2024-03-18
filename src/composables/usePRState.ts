import { computed } from 'vue'
import { useComputedElementQuery, $, $$ } from '../composables/useComputedElementQuery'

import { reverseObject, createObjectFromKeysAndValues } from '../objectHelpers'

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

    const obsoleteUndefinedStateActions = [
        'This branch has not been deployed'
    ]
    if (stateActions['undefined-state']) {
        stateActions['undefined-state'] = stateActions['undefined-state']?.filter(msg => !obsoleteUndefinedStateActions.includes(String(msg)))

        if(stateActions['undefined-state'].length === 0) {
            delete stateActions['undefined-state']
        }
    }

    return stateActions
}

export function usePRDetails() {
    const checkboxElements = useComputedElementQuery(() => $$('input[type="checkbox"].task-list-item-checkbox:not(:checked)'))
    const unaddressedTasks = computed(() => checkboxElements.value.map(cb => cb.parentElement?.innerText.split('\n')[0].trim()))

    const issueLinkElement = useComputedElementQuery(() => $('.issue-link'))

    const linkedIssue = computed(() => issueLinkElement.value
        ? { issueNumber: issueLinkElement.value.innerText, href: issueLinkElement.value.getAttribute('href') }
        : undefined
    )

    const status = useComputedElementQuery(() => $('.State')?.title.toLowerCase().replace('status: ', ''))

    const hasPreviewLabel = useComputedElementQuery(() => !!$('.discussion-sidebar-item .IssueLabel[data-name="preview"]'))

    const stateActions = useComputedElementQuery(() => getStateActions($$('.branch-action-item')))

    return {
        unaddressedTasks,
        status,
        linkedIssue,
        hasPreviewLabel,
        stateActions
    }
}
