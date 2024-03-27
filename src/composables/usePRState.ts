import { computed } from 'vue'
import { useComputedElementQuery, $, $$ } from '../composables/useComputedElementQuery'

const ACTION_IGNORE_LIST = [
    'All checks have passed',
    'This branch has not been deployed',
    'Some checks haven\u2019t completed yet',
    'Review required',
    'Merging is blocked',
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

    const unaddressedTasks = computed(() => {
        const tasks = checkboxElements.value
            .map(checkbox => {
                if(!(checkbox instanceof HTMLInputElement)) {
                    return undefined
                }

                const stickyHeaderHeight = $('.gh-header-sticky')?.getBoundingClientRect().height || 0
                const scrollToTopCoordinate = stickyHeaderHeight + checkbox.getBoundingClientRect().top

                return {
                    description: checkbox.parentElement?.innerText.split('\n')[0].trim(),
                    scrollIntoView: () => window.scrollTo({ top: scrollToTopCoordinate, behavior: 'smooth' }),
                    check: () => checkbox.checked = true
                }
            })
            .filter(Boolean)

        return tasks as Exclude<typeof tasks[number], undefined>[] // TODO: add ts-reset
    })

    const issueLinkElement = useComputedElementQuery(() => $('.timeline-comment .issue-link'))

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

    const previewDeploymentComment = useComputedElementQuery<HTMLElement | null>(() => {
        const comments = $$('.TimelineItem-avatar a[href="/apps/github-actions"]')
            .map(e => e?.parentElement?.parentElement)
            .filter(e => e && e.classList.contains('TimelineItem'))

        return comments[comments.length - 1] ?? null
    })

    const scrollToPreviewDeploymentComment = computed(() => previewDeploymentComment.value?.scrollIntoView)

    const previewDeploymentLinks = computed(() => {
        function getLink(a: HTMLElement) {
            const href = a.getAttribute('href')            
            
            if(!href) { return undefined }

            try {
                return { text: new URL(href).host, href }
            } catch {
                console.log('invalid url:', href)
                return undefined
            }
        }

        const links = $$('.comment-body a', previewDeploymentComment.value as HTMLElement | null)
            .map(getLink)
            .filter(link => link && !link.text.includes('notion'))

        return links as Exclude<typeof links[number], undefined>[] // TODO: add ts-reset
    })

    function scrollToActions() {
        $('.merge-pr')?.scrollIntoView()
    }

    return {
        unaddressedTasks,
        status,
        linkedIssue,
        hasPreviewLabel,
        actions,
        previewDeploymentLinks,
        scrollToPreviewDeploymentComment,
        scrollToActions
    }
}
