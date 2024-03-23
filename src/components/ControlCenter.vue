<script setup lang="ts">
import { computed, watch } from 'vue';
import { usePRDetails } from '../composables/usePRState';
import { copyShareable } from '../copyShareable';
import Icon from './Icon.vue'
import { GM_openInTab } from '$';
import HoverExpandable from './HoverExpandable.vue'
import { COLORS, CONTROLL_CENTER_PADDING } from '../constants'
import { Color } from '../types'

const { unaddressedTasks, status, linkedIssue, hasPreviewLabel, actions, previewDeploymentLinks } = usePRDetails()

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
        <HoverExpandable>
            <template #icon>
                <Icon
                    name="oi-hash"
                    :color="linkedIssue ? mergeColorOr('green') : 'fgMuted'"
                    title="Issue link provided in first comment"
                    style="cursor: pointer;"
                    @click="() => openInNewTab(linkedIssue?.href ?? '')" 
                />
            </template>

            <h1>Addresses Issue:</h1> <a :href="linkedIssue?.href ?? ''" target="_blank">#{{ linkedIssue?.issueNumber }}</a>
        </HoverExpandable>

        <Icon name="oi-chevron-down" />

        <HoverExpandable :disable-hover="unaddressedTasks.length === 0">
            <template #icon>
                <Icon
                    name="oi-tasklist"
                    :color="unaddressedTasks.length ? mergeColorOr('red', 'fgMuted') : mergeColorOr('green')"
                    :hide-pill="!unaddressedTasks.length"
                    :pill-text="unaddressedTasks.length"
                    title="unaddressed tasks(s)"
                />
            </template>

            <h1>{{ unaddressedTasks.length }} unadressed tasks(s):</h1>
            <div class='unaddressed-task' v-for="(task, i) in unaddressedTasks">
                <input type="checkbox" :value="true" @click.once="task.check" />
                <span @click="task.scrollIntoView">{{ task.description }}</span>
            </div>
        </HoverExpandable>

        <Icon name="oi-chevron-down" />

        <HoverExpandable :disable-hover="!successActions.length && !nonSuccessActions.length">
            <template #icon>
                <Icon
                    v-if="nonSuccessActions.length"
                    name="oi-x-circle"
                    :color="mergeColorOr('red', 'fgMuted')"
                    :pill-text="nonSuccessActions.length"
                    title="erronous action(s)"
                />
                <Icon
                    v-else  
                    name="oi-check-circle"
                    :color="mergeColorOr('green')"
                    :pill-text="successActions.length"
                    :hide-pill="isMerged"
                    title="successful action(s)"
                />
            </template>

            <template v-if="nonSuccessActions.length">
                <h1>{{ nonSuccessActions.length }} erronous action(s):</h1>
                <ul>
                    <li v-for="action in nonSuccessActions">{{ action.state }}: {{ action.action }}</li>
                </ul>
            </template>

            <template v-if="successActions.length">
                {{ successActions.length }} successful action(s):
                <ul>
                    <li v-for="action in successActions">{{ action.state }}: {{ action.action }}</li>
                </ul>
            </template>
        </HoverExpandable>

        <Icon name="oi-chevron-down" />

        <HoverExpandable :disable-hover="!previewDeploymentLinks.length || isMerged">
            <template #icon>
                <Icon
                    name="oi-rocket"
                    :color="hasPreviewLabel ? mergeColorOr('green') : mergeColorOr('red', 'fgMuted')"
                    title="Preview Deployment"
                />
            </template>
            <h1>Preview deployment links:</h1>
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
            style="cursor: pointer; position: relative; z-index: 20;"
            @click="() => copyShareable(true)"
        />
    </div>
</template>

<style scoped>

.control-center {
    color: v-bind('COLORS.normalText');
    position: fixed;
    top: 208px;
    right: 0;
    padding: v-bind('CONTROLL_CENTER_PADDING');
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

h1 {
    font-size: 1em;
    display: inline-block;
    font-weight: 600;
}

li {
    margin-left: 20px;
}

p {
    margin-bottom: 0;
}
</style>
