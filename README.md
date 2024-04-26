# GitHub PR Control Center

A Userscript that adds a control center to GitHub PR pages to manage the lifecycle of your PR built via Vite + Vue3.

# Install

First build the Userscript via:
```sh
pnpm build
```

Then add the Userscript generated at `dist/github-pr-control.user.js` to your Userscript manager (e.g. [Tampermonkey](https://www.tampermonkey.net/))

# Feature Overview

This userscript adds a sidebar on github PR pages with 5 sections and an easy share button. This has special focus for [Arc Browser](https://arc.net/)'s [peek previews](https://resources.arc.net/hc/en-us/articles/19335302900887-Peek-Preview-Sites-From-Pinned-Tabs).

## 1 Linked Issue

This sections searches for an issue link in the first comment. Clicking either the `#` icon or the `#2444` link in the following example screenshot opens the issue in a new tab. When this tab is pinned or favourited in Arc, this is compatible to open in a peek tab on top of the current tab.

<img width="163" src="https://github.com/damgem/github-pr-control/assets/44696746/fff7949f-0dda-4b26-9126-36d7da652ff3">

## 2 Unadressed Tasks

This section lists all unchecked checkboxes in the comment history of this PR:

<img width="493" src="https://github.com/damgem/github-pr-control/assets/44696746/b8159822-85c2-42e3-bf36-d9d11f63c073">

Clicking on an unadressed task, scrolls to that task and highlights it:

<img width="769" src="https://github.com/damgem/github-pr-control/assets/44696746/f8bfe9c3-d682-4841-8a74-22b9e3caab31">

When you've adressed all tasks:

<img width="239" src="https://github.com/damgem/github-pr-control/assets/44696746/8b0a813f-08e3-4a5a-96cc-fcdecd6c9409">

## 3 Checks

<img width="436" src="https://github.com/damgem/github-pr-control/assets/44696746/1b81bad6-36f3-4a49-9296-f18c9bd70a68">

## 4 Preview Deployment

If you have not yet triggered the preview deployment via the `Preview` label this section reminds you of that:

<img width="411" src="https://github.com/damgem/github-pr-control/assets/44696746/f1768229-9635-4fd0-8b3b-5ef15a976598">

Otherwise it finds the preview deployment comment from the github-actions bot and displays all relevant links:

<img width="349" src="https://github.com/damgem/github-pr-control/assets/44696746/17d49f61-9fde-4200-9120-fdca207efd90">

## 5 Final Actions

As a final step you're getting displayed all reasons why the PR cannot be merged yet. These are all messages from the merge section at the bottom of a PR excluding the checks that are displayed in section 3.

<img width="481" src="https://github.com/damgem/github-pr-control/assets/44696746/96318cd2-4836-454c-a739-78994c76d6f5">

## 6 Share Button

Click this button to copy a formatted share message and open the desktop slack app via deep links.

<img width="267" src="https://github.com/damgem/github-pr-control/assets/44696746/fd432d48-13c3-4b8f-8ed5-2ef1809e6f13">

Formatted message example:
> PR: Add cookie banner #2554 | https://github.com/my-org/my-project/pull/2554
