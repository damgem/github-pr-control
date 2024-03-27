<script setup lang="ts">
import { computed, watch } from 'vue';
import { usePRDetails } from '../composables/usePRState';
import { copyShareable } from '../copyShareable';
import Icon from './Icon.vue'
import { GM_openInTab } from '$';
import HoverExpandable from './HoverExpandable.vue'
import { COLORS, CONTROLL_CENTER_PADDING_LEFT } from '../constants'
import { Color } from '../types'

const { unaddressedTasks, status, linkedIssue, hasPreviewLabel, actions, previewDeploymentLinks, scrollToPreviewDeploymentComment, scrollToActions } = usePRDetails()

const successActions = computed(() => actions.value.filter(({state}) => state === 'success'))
const nonSuccessActions = computed(() => actions.value.filter(({state}) => state !== 'success'))

function openInNewTab(url: string) {
    window.open(url, '_blank') // Using window.open instead of GM_openInTab, as GM_openInTab does not open a tiny arc in Arc browser
}

const isMerged = computed(() => status.value === 'merged')

function mergeColorOr(nonMergeColor: Color, mergeColor?: Color): Color {
    return isMerged.value ? (mergeColor ?? 'purple') : nonMergeColor
}
</script>

<template>
    <div class='control-center'>
        <HoverExpandable :only-head="!linkedIssue">
            <template #icon>
                <Icon
                    name="oi-hash"
                    :color="linkedIssue ? mergeColorOr('green') : 'fgMuted'"
                    title="Issue link provided in first comment"
                    style="cursor: pointer;"
                    @click="() => openInNewTab(linkedIssue?.href ?? '')" 
                />
            </template>
            <template #head>
                <span v-if="linkedIssue">Linked Issue</span>
                <span v-else>First comment does not include issue that this PR addresses</span>
            </template>
            <a :href="linkedIssue?.href ?? ''" target="_blank">#{{ linkedIssue?.issueNumber }}</a>
        </HoverExpandable>

        <Icon name="oi-chevron-down" />

        <HoverExpandable :only-head="!unaddressedTasks.length">
            <template #icon>
                <Icon
                    name="oi-tasklist"
                    :color="unaddressedTasks.length ? mergeColorOr('red', 'fgMuted') : mergeColorOr('green')"
                    :hide-pill="!unaddressedTasks.length"
                    :pill-text="unaddressedTasks.length"
                    title="unaddressed tasks(s)"
                    :click-effect="unaddressedTasks[0]?.scrollIntoView"
                />
            </template>
            <template #head>
                <span v-if="unaddressedTasks.length === 0">All tasks are adressed 🎉</span>
                <span v-else-if="unaddressedTasks.length === 1">1 unadressed task</span>
                <span v-else>{{ unaddressedTasks.length }} unadressed tasks</span>
            </template>
            <div v-if="unaddressedTasks.length" v-for="(task, i) in unaddressedTasks" class='unaddressed-task'>
                <div style="display: flex; align-items: start;">
                    <input style="margin-top: 5px;" type="checkbox" :value="true" @click.once="task.check" />
                    <span @click="task.scrollIntoView">{{ task.description }}</span>
                </div>
            </div>
        </HoverExpandable>

        <Icon name="oi-chevron-down" />

        <HoverExpandable :only-head="!nonSuccessActions.length && !successActions.length">
            <template #icon>
                <Icon
                    v-if="nonSuccessActions.length"
                    name="oi-x-circle"
                    :color="mergeColorOr('red', 'fgMuted')"
                    :pill-text="nonSuccessActions.length"
                    title="erronous action(s)"
                    :click-effect="scrollToActions"
                />
                <Icon
                    v-else  
                    name="oi-check-circle"
                    :color="mergeColorOr('green')"
                    :pill-text="successActions.length"
                    :hide-pill="isMerged"
                    title="successful action(s)"
                    :click-effect="scrollToActions"
                />
            </template>
            <template #head>
                <span v-if="nonSuccessActions.length === 1">1 non successfull action</span>
                <span v-else-if="nonSuccessActions.length > 1">{{ nonSuccessActions.length }} non successfull actions</span>
                <span v-else-if="successActions.length === 1">1 successfull action</span>
                <span v-else-if="successActions.length > 1">{{ nonSuccessActions.length }} successfull actions</span>
                <span v-else>No relevant actions found</span>
            </template>

            <ul v-if="nonSuccessActions.length">
                <li v-for="action in nonSuccessActions">{{ action.state }}: {{ action.action }}</li>
            </ul>
            <ul v-if="successActions.length">
                <li v-for="action in successActions">{{ action.state }}: {{ action.action }}</li>
            </ul>
        </HoverExpandable>

        <Icon name="oi-chevron-down" />

        <HoverExpandable :only-head="!previewDeploymentLinks.length">
            <template #icon>
                <Icon
                    name="oi-rocket"
                    :color="hasPreviewLabel ? mergeColorOr('green') : mergeColorOr('red', 'fgMuted')"
                    title="Preview Deployment"
                    :click-effect="scrollToPreviewDeploymentComment"
                />
            </template>
            <template #head>
                <span v-if="previewDeploymentLinks.length">Preview Deployment Links</span>
                <span v-else>Add the <code>Preview</code> label to trigger the preview deployment!</span>
            </template>
            <ul>
                <li v-for="link in previewDeploymentLinks">
                    <a :href="link.href ?? ''">{{ link.text }}</a>
                </li>
            </ul>
        </HoverExpandable>

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
        text-decoration: underline;
        margin-left: 4px;
        font-weight: normal;
    }
}

li {
    margin-left: 20px;
}

p {
    margin-bottom: 0;
}
</style>
