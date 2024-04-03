import { GM_setClipboard, GM_notification, GM_openInTab } from '$';
import { $ } from "./querySelector"

export function copyShareable(directlyOpenSlack = false) {
    const title = $('.js-issue-title')?.innerText
    const headerNumber = $('.gh-header-number')?.innerText
    
    const fullURL = new URL(window.location.href)
    const displayURL = `${fullURL.protocol}//${fullURL.host}${fullURL.pathname}`

    const isPullRequest = $('#pull-requests-tab.selected') !== null
    const type = isPullRequest ? 'PR' : 'Issue'

    const copyValue = `${type}: ${title} ${headerNumber} | ${displayURL}`
    GM_setClipboard(copyValue, 'text')

    if(directlyOpenSlack) {
        window.open('slack://open')
    } else {
        GM_notification({
            title: 'PR Sharable copied',
            text: 'Directly open Slack?',
            silent: true,
            timeout: 2500,
            onclick: () => GM_openInTab('slack://open')
        })
    }
}
