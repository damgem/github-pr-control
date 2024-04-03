import { computed } from 'vue'
import { useComputedElementQuery } from '../composables/useComputedElementQuery'
import { highlightScrollTo } from '../logic/highlightElement'
import { toStatusString } from '../logic/toStatusString'
import { $, $$ } from '../logic/querySelector'

const ACTION_IGNORE_LIST = [
    'All checks have passed',
    'Some checks were not successful',
    'Some checks haven\u2019t completed yet',
    'This branch has not been deployed',
]

function processActionItems(actionItems: HTMLElement[]) {

}

export function usePRDetails() {

    const status = useComputedElementQuery(() => $('.State')?.title.toLowerCase().replace('status: ', ''))

    const linkedIssue = useComputedElementQuery(() => {
        const link = $('.timeline-comment .issue-link')

        if(!link) { return undefined }
        
        return {
            issueNumber: link.innerText.replace('#', ''),
            href: link.getAttribute('href')
        }
    })

    const unaddressedTasks = useComputedElementQuery(() => {
        const tasks = $$('input[type="checkbox"].task-list-item-checkbox:not(:checked)')
            .map(checkbox => {
                if(!(checkbox instanceof HTMLInputElement)) { return undefined }

                return {
                    description: checkbox.parentElement?.innerText.split('\n')[0].trim(),
                    scrollIntoView: () => highlightScrollTo(checkbox?.parentElement),
                    check: () => checkbox.checked = true
                }
            })
            .filter(Boolean)

        return tasks as Exclude<typeof tasks[number], undefined>[] // TODO: add ts-reset
    })

    const checks = useComputedElementQuery(() => {
        return $$('.merge-status-list > .merge-status-item').map(item => {
            const name = $('strong', item)?.innerHTML.replace('(pull_request)', '').replace('CI /', '').trim()

            const success = !!item.querySelector('svg.octicon-check')
            const error = !!item.querySelector('svg.octicon-x')
            const status = toStatusString(success, error)

            return { name, status } as const
        })
    })

    const hasPreviewLabel = useComputedElementQuery(() => !!$('.discussion-sidebar-item .IssueLabel[data-name="preview"]'))

    const previewDeploymentLinks = useComputedElementQuery(() => {
        const comments = $$('.TimelineItem-avatar a[href="/apps/github-actions"]')
            .map(e => e?.parentElement?.parentElement)
            .filter(e => e && e.classList.contains('TimelineItem'))

        const comment = comments[comments.length - 1] as HTMLElement | undefined

        function getLink(a: HTMLElement) {
            const href = a.getAttribute('href')            
            
            if(!href) { return undefined }

            try {
                return { text: new URL(href).host, href }
            } catch {
                return undefined
            }
        }

        const links = $$('.comment-body a', comment)
            .map(getLink)
            .filter(link => link && !link.text.includes('notion'))

        return links as Exclude<typeof links[number], undefined>[] // TODO: add ts-reset
    })

    const actions = useComputedElementQuery(() => {
        const actionItems = $$('.branch-action-item')
        
        const getTitle = (item: HTMLElement) => $('.status-heading', item)?.innerText ?? ''
        const getDescription = (item: HTMLElement) => $('.status-meta', item)?.innerText ?? ''

        function getStatus(item: HTMLElement) {
            const indicatorClassList = Array.from($('.completeness-indicator', item)?.classList ?? [])
            const success = indicatorClassList.includes('completeness-indicator-success')
            const error = indicatorClassList.some(className => className.startsWith('completeness-indicator-') && className !== 'completeness-indicator-success')
            return toStatusString(success, error)
        }
    
        function isChecksAction(item: HTMLElement) {
            const toggle = $('span.statuses-toggle-opened', item)
            if(!toggle) { return false }
            return ['Hide all checks', 'Show all checks'].includes(toggle.innerText)
        }
    
        return actionItems
            .filter(item => !isChecksAction(item))
            .map(item => ({ title: getTitle(item), description: getDescription(item), status: getStatus(item) } as const))
            .filter(({ title }) => !ACTION_IGNORE_LIST.includes(title))
    })

    return {
        status,
        linkedIssue,
        unaddressedTasks,
        checks,
        hasPreviewLabel,
        previewDeploymentLinks,
        actions,
    }
}
