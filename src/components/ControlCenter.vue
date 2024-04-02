<script setup lang="ts">
import { computed, watch } from 'vue';
import { usePRDetails } from '../composables/usePRState';
import { copyShareable } from '../copyShareable';
import Icon from './Icon.vue'
import { GM_openInTab } from '$';
import Section from './Section.vue'
import { COLORS, CONTROLL_CENTER_PADDING_LEFT } from '../constants'
import { Color } from '../types'

const { unaddressedTasks, status, linkedIssue, hasPreviewLabel, checks, actions, previewDeploymentLinks, scrollToActions } = usePRDetails()

const successActions = computed(() => actions.value.filter(({state}) => state === 'success'))
const nonSuccessActions = computed(() => actions.value.filter(({state}) => state !== 'success'))

function openInNewTab(url: string) {
    window.open(url, '_blank') // Using window.open instead of GM_openInTab, as GM_openInTab does not open a tiny arc in Arc browser
}

const isMerged = computed(() => status.value === 'merged')

const numFailedChecks = computed(() => checks.value.filter(({ status }) => status === 'error').length)
const numPendingChecks = computed(() => checks.value.filter(({ status }) => !status).length)
const numSuccessfulChecks = computed(() => checks.value.filter(({ status }) => status === 'success').length)
const numChecks = computed(() => checks.value.length)

const allChecksPassed = computed(() => numFailedChecks.value === 0 && numPendingChecks.value === 0)

const checksPillText = computed(() => numFailedChecks.value || numPendingChecks.value )

function mergeColorOr(nonMergeColor: Color, mergeColor?: Color): Color {
    return isMerged.value ? (mergeColor ?? 'purple') : nonMergeColor
}

const statusColors = {
    'success': COLORS.green,
    'error': COLORS.red,
    'pending': COLORS.orange,
}
</script>

<template>
    <div class='control-center'>
        <Section :alt-mode="!linkedIssue">
            <template #icon>
                <Icon
                    name="oi-hash"
                    :color="linkedIssue ? mergeColorOr('green') : 'fgMuted'"
                    title="Open Issue"
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
                    :hide-pill="!unaddressedTasks.length"
                    :pill-text="unaddressedTasks.length"
                    title="See first unaddressed task"
                    :click-effect="unaddressedTasks[0]?.scrollIntoView"
                />
            </template>
            <template #head>
                {{ unaddressedTasks.length }} unadressed task{{ unaddressedTasks.length !== 1 ? 's' : '' }}
            </template>
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
                    :name="allChecksPassed ? 'oi-check-circle' : 'oi-x-circle'"
                    :color="allChecksPassed ? mergeColorOr('green') : mergeColorOr('red', 'fgMuted')"
                    :pill-text="checksPillText"
                    :hide-pill="!checks.length"
                    title="Checks"
                    :click-effect="scrollToActions"
                />
            </template>
            <template #head>
                <template v-if="numFailedChecks">
                    {{ numFailedChecks }} check<template v-if="numFailedChecks > 1">s</template> failed
                </template>
                <template v-else-if="numPendingChecks">
                    {{ numPendingChecks }} check<template v-if="numPendingChecks > 1">s</template> is pending
                </template>
                <template v-else>
                    {{ numSuccessfulChecks }} check<template v-if="numPendingChecks > 1">s</template> successfull
                </template>
            </template>
            <ul>
                <li v-for="{status, name} in checks" :style="{color: statusColors[status ?? 'pending']}"> {{ name }}</li>
            </ul>
            <template #alt>No checks found</template>
        </Section>

        <Icon name="oi-chevron-down" />

        <Section :alt-mode="!hasPreviewLabel">
            <template #icon>
                <Icon
                    name="oi-rocket"
                    :color="hasPreviewLabel ? mergeColorOr('green') : mergeColorOr('red', 'fgMuted')"
                    title="Visit preview deployment"
                    :click-effect="previewDeploymentLinks.length ? () => openInNewTab(previewDeploymentLinks[0].href) : undefined"
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

        <!-- Adding negative margin, to match amount of white space of the taller chevrons -->
        <Icon name="oi-horizontal-rule" style="margin: -2.75px 0;"/>

        <Icon
            name="oi-share-android"
            title="Copy PR title & URL"
            style="position: relative; z-index: 20;"
            :click-effect="() => copyShareable(true)"
        />
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
</style>
