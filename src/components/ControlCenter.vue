<script setup lang="ts">
import { computed, watch } from 'vue';
import { usePRDetails } from '../composables/usePRState';
import { copyShareable } from '../copyShareable';
import Icon from './Icon.vue'
import { GM_openInTab } from '$';
import HoverExpandable from './HoverExpandable.vue'
import { COLORS, CONTROLL_CENTER_PADDING } from '../constants'

const { unaddressedTasks, status, linkedIssue, hasPreviewLabel, actions, previewDeploymentLinks } = usePRDetails()

const successActions = computed(() => actions.value.filter(({state}) => state === 'success'))
const nonSuccessActions = computed(() => actions.value.filter(({state}) => state !== 'success'))

watch(previewDeploymentLinks, (neww, old) => {
    console.log('new', neww, 'old', old)
})
</script>

<template>
    <div class='control-center'>
        <HoverExpandable>
            <template #icon>
                <Icon
                    name="oi-hash"
                    :color="linkedIssue ? 'green' : 'fgHighlight'"
                    :hide-pill="linkedIssue?.issueNumber === undefined"
                    :pill-text="linkedIssue?.issueNumber"
                    title="Issue link provided in first comment"
                    style="cursor: pointer;"
                    @click="() => GM_openInTab(linkedIssue?.href ?? '', { /* TODO: open in '_blank' target */ })"
                />
            </template>

            Addresses Issue: <a :href="linkedIssue?.href ?? ''" target="_blank">#{{ linkedIssue?.issueNumber }}</a>
        </HoverExpandable>

        <Icon name="oi-chevron-down" />

        <HoverExpandable :disable-hover="unaddressedTasks.length === 0">
            <template #icon>
                <Icon
                    name="oi-tasklist"
                    :color="unaddressedTasks.length ? 'red' : 'green'"
                    :hide-pill="!unaddressedTasks.length"
                    :pill-text="unaddressedTasks.length"
                    title="unaddressed issue(s)"
                />
            </template>

            {{ unaddressedTasks.length }} unadressed tasks(s):
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
                    color="red"
                    :pill-text="nonSuccessActions.length"
                    title="erronous action(s)"
                />
                <Icon
                    v-else  
                    name="oi-check-circle"
                    color="green"
                    :pill-text="successActions.length"
                    title="successful action(s)"
                />
            </template>

            <template v-if="nonSuccessActions.length">
                {{ nonSuccessActions.length }} erronous action(s):
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

        <HoverExpandable :disable-hover="!successActions.length && !previewDeploymentLinks.length">
            <template #icon>
                <Icon
                    name="oi-rocket"
                    :color="hasPreviewLabel ? 'green' : 'red'"
                    title="Preview Deployment"
                />
            </template>
            Preview deployment links:
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
            style="cursor: pointer;"
            @click="() => copyShareable(true)"
        />
    </div>
</template>

<style scoped>
li {
    margin-left: 16px;
}

.control-center {
    color: v-bind('COLORS.fgHighlight');
    position: fixed;
    top: 208px;
    right: 0;
    padding: v-bind('CONTROLL_CENTER_PADDING');
    border: 1px solid v-bind('COLORS.border');
    border-radius: 6px 0 0 6px;
    background-color: v-bind('COLORS.bgHighlight');
}

.control-center p {
    margin-bottom: 0;
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
</style>
