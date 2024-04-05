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

export function usePRDetails() {

    const currentGitHubPR = useComputedElementQuery(() => {
        const parts = window.location.pathname
            .split('/')
            .filter(Boolean)

        if(parts.length !== 4 || parts[2] !== 'pull') { return undefined }

        return {
            organization: parts[0],
            repository: parts[1],
            issueNumber: parseInt(parts[3]),
        }
    })

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

        return tasks 
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
            .filter(Boolean)
            .filter(e => e.classList.contains('TimelineItem'))

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
            .filter(Boolean)
            .filter(link => !link.text.includes('notion'))

        return links
    })

    const actions = useComputedElementQuery(() => {
        const actionItems = $$('.mergeability-details > .branch-action-item')

        function isVisibleInActionItem(item: HTMLElement | undefined | null) {
            let element = item

            while(element && !element.classList.contains('branch-action-item')) {
                if(window.getComputedStyle(element).display === 'none') {
                    return false;
                }
                element = element.parentElement
            }

            return !!element
        }
        
        function getTitle(item: HTMLElement) {
            return $$('.status-heading', item)
                .filter(isVisibleInActionItem)
                .map(h => h.innerText)
                .join(' | ')
        }

        const getDescription = (item: HTMLElement) => {
            // if item.children contains div with .merging-body then cycle through all children and get the one with `display !== none` 
            return $$('.status-meta', item)
                .filter(isVisibleInActionItem)
                .map(h => h.innerText)
                .join(' | ')
        }

        function getStatus(item: HTMLElement) {
            const statuses = $$('.completeness-indicator', item)
                .filter(isVisibleInActionItem)
                .map(icon => {
                    const indicatorClassList = Array.from(icon.classList)
                    const success = indicatorClassList.includes('completeness-indicator-success')
                    const error = indicatorClassList.some(className => className.startsWith('completeness-indicator-') && className !== 'completeness-indicator-success')

                    return toStatusString(success, error)
                })

            return statuses.length === 1 ? statuses[0] : undefined
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
        currentGitHubPR,
        status,
        linkedIssue,
        unaddressedTasks,
        checks,
        hasPreviewLabel,
        previewDeploymentLinks,
        actions,
    }
}
