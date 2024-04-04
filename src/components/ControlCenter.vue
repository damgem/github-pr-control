<script setup lang="ts">
import { computed } from 'vue';
import { usePRDetails } from '../composables/usePRState';
import { copyShareable } from '../logic/copyShareable';
import { highlightScrollTo } from '../logic/highlightElement'
import { $ } from '../logic/querySelector'
import Icon from './Icon.vue'
import Section from './Section.vue'
import { COLORS, CONTROLL_CENTER_PADDING_LEFT } from '../constants'
import { Color } from '../types'

const { currentGitHubPR, unaddressedTasks, status, linkedIssue, hasPreviewLabel, checks, actions, previewDeploymentLinks } = usePRDetails()

const successActions = computed(() => actions.value.filter(({status}) => status === 'success'))
const nonSuccessActions = computed(() => actions.value.filter(({status}) => status !== 'success'))

function openInNewTab(url: string) {
    window.open(url, '_blank') // Using window.open instead of GM_openInTab, as GM_openInTab does not open a tiny arc in Arc browser
}

const isMerged = computed(() => status.value === 'merged')

const failedChecks = computed(() => checks.value.filter(({ status }) => status === 'error'))
const successfulChecks = computed(() => checks.value.filter(({ status }) => status ==='success'))
const pendingChecks = computed(() => checks.value.filter(({ status }) => !status))

const numChecks = computed(() => checks.value.length)
const numFailedChecks = computed(() => failedChecks.value.length)
const numSuccessfulChecks = computed(() => successfulChecks.value.length)
const numPendingChecks = computed(() => pendingChecks.value.length)

const checksPillNumber = computed(() => numFailedChecks.value || numPendingChecks.value)

function scrollToChecks() {
    highlightScrollTo($('.merge-status-list')?.parentElement)
}

function scrollToActions(){
    highlightScrollTo($('.branch-action-body'))
}

function mergeColorOr(nonMergeColor: Color, mergeColor?: Color): Color {
    return isMerged.value ? (mergeColor ?? 'purple') : nonMergeColor
}

function statusToColor(status: 'success' | 'error' | undefined) {
    if (!status) {
        return COLORS.orange
    }
    return status === 'success' ? COLORS.green : COLORS.red
}
</script>

<template>
    <div class='control-center' v-if="currentGitHubPR">
        <Section :alt-mode="!linkedIssue">
            <template #icon>
                <Icon
                    name="oi-hash"
                    :color="linkedIssue ? mergeColorOr('green') : 'fgMuted'"
                    title="Open issue page"
                    style="cursor: pointer;"
                    @click="() => openInNewTab(linkedIssue?.href ?? '')" 
                />
            </template>
            <template #head>Linked Issue</template>
            <a :href="linkedIssue?.href ?? ''" target="_blank">#{{ linkedIssue?.issueNumber }}</a>
            <template #alt>First comment does not include the issue that this PR addresses</template>
        </Section>

        <Icon name="oi-chevron-down" />

        <Section :alt-mode="!unaddressedTasks.length">
            <template #icon>
                <Icon
                    name="oi-tasklist"
                    :color="unaddressedTasks.length ? mergeColorOr('red', 'fgMuted') : mergeColorOr('green')"
                    :pill-text="unaddressedTasks.length"
                    :hide-pill="!unaddressedTasks.length"
                    title="Scroll to first unaddressed tasks"
                    :click-effect="unaddressedTasks[0]?.scrollIntoView"
                />
            </template>
            <template #head>Unadressed Tasks</template>
            <div v-if="unaddressedTasks.length" v-for="(task, i) in unaddressedTasks" class='unaddressed-task'>
                <div style="display: flex; align-items: start;">
                    <input style="margin-top: 5px;" type="checkbox" :value="true" @click.once="task.check" />
                    <span @click="task.scrollIntoView">{{ task.description }}</span>
                </div>
            </div>
            <template #alt>All tasks are adressed 🎉</template>
        </Section>

        <Icon name="oi-chevron-down" />

        <Section :alt-mode="!checks.length">
            <template #icon>
                <Icon
                    :name="numFailedChecks ? 'oi-x-circle' : numPendingChecks? 'oi-clock' : 'oi-check-circle'"
                    :color="numFailedChecks ? 'red' : numPendingChecks ? 'orange' : mergeColorOr(numSuccessfulChecks ? 'green' : 'fgMuted')"
                    :pill-text="checksPillNumber"
                    :hide-pill="!checksPillNumber"
                    title="See checks"
                    :click-effect="checks.length ? scrollToChecks : undefined"
                />
            </template>
            <template #head>Checks</template>
            <template v-if="failedChecks.length">
                <strong :style="{ color: COLORS.red }">Error</strong>
                <ul>
                    <li v-for="{ name } in failedChecks">{{ name }}</li>
                </ul>
            </template>
            <template v-if="pendingChecks.length">
                <strong :style="{ color: COLORS.orange }">Pending</strong>
                <ul>
                    <li v-for="{ name } in pendingChecks">{{ name }}</li>
                </ul>
            </template>
            <template v-if="successfulChecks.length">
                <strong :style="{ color: COLORS.green }">Success</strong>
                <ul>
                    <li v-for="{ name } in successfulChecks">{{ name }}</li>
                </ul>
            </template>
            
            <template #alt>No checks found</template>
        </Section>

        <Icon name="oi-chevron-down" />

        <Section :alt-mode="!hasPreviewLabel">
            <template #icon>
                <Icon
                    name="oi-rocket"
                    :color="hasPreviewLabel && previewDeploymentLinks.length ? mergeColorOr('green') : hasPreviewLabel ? 'orange' : status === 'closed' ? 'fgMuted' : mergeColorOr('red', 'fgMuted')"
                    title="Open preview"
                    :click-effect="hasPreviewLabel && previewDeploymentLinks.length ? () => openInNewTab(previewDeploymentLinks[0].href) : undefined"
                />
            </template>
            <template #head>Preview Deployment Links</template>
            <ul v-if="previewDeploymentLinks.length">
                <li v-for="link in previewDeploymentLinks">
                    <a :href="link.href ?? ''">{{ link.text }}</a>
                </li>
            </ul>
            <span :style="{ backgroundColor: COLORS.fgMuted }" v-else>Waiting for <code>github-actions</code> bot comment ⏳</span>
            <template #alt>Add the <code>Preview</code> label to trigger the preview deployment!</template>
        </Section>

        <Icon name="oi-chevron-down" />

        <Section :alt-mode="!actions.length">
            <template #icon>
                <Icon
                    :name="nonSuccessActions.length ? 'oi-stop' : 'oi-verified'"
                    :color="mergeColorOr(nonSuccessActions.length ? 'red' : successActions.length ? 'green' : 'fgMuted')"
                    title="See actions"
                    :click-effect="actions.length ? scrollToActions : undefined"
                    :pill-text="nonSuccessActions.length"
                    :hide-pill="!nonSuccessActions.length"
                />
            </template>
            <template #head>Final Actions</template>
            <div v-for="{ title, description, status } in actions">
                <strong :style="{color: statusToColor(status)}">{{ title }}</strong>
                <p :style="{color: COLORS.fgMuted, lineHeight: 1.25, marginBottom:'4px'}">{{ description }}</p>
            </div>
            <template #alt>No actions found</template>
        </Section>

        <!-- Adding negative margin, to match amount of white space of the taller chevrons -->
        <Icon name="oi-horizontal-rule" style="margin: -2.75px 0;"/>

        <Section alt-mode>
            <template #icon>
                <Icon
                    name="oi-share-android"
                    title="Copy PR title & URL"
                    style="position: relative; z-index: 20;"
                    :click-effect="() => copyShareable(true)"
                />
            </template>
            <template #alt>Copy PR title & URL to clipboard</template>
        </Section>
    </div>
</template>

<style scoped>

.control-center {
    color: v-bind('COLORS.normalText');
    position: fixed;
    top: 208px;
    right: 0;
    padding: 8px 4px 8px v-bind('CONTROLL_CENTER_PADDING_LEFT');
    border: 1px solid v-bind('COLORS.borderHighlight');
    border-right-width: 0;
    border-radius: 6px 0 0 6px;
    background-color: v-bind('COLORS.bgHighlight');
}

.unaddressed-task {
    display: block;

    span {
        cursor: pointer;
        margin-left: 4px;
        font-weight: normal;
    }
}

li {
    margin-left: 16px;
}

p {
    margin-bottom: 0;
}
</style>../logic/copyShareable
