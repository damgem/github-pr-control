<script setup lang="ts">
import { computed } from 'vue';
import { usePRDetails } from '../composables/usePRState';
import { copyShareable } from '../copyShareable';
import Icon from './Icon.vue'
import { GM_openInTab } from '$';

const { unaddressedTasks, status, linkedIssue, hasPreviewLabel, actions } = usePRDetails()

const successActions = computed(() => actions.value.filter(({state}) => state === 'success'))
const nonSuccessActions = computed(() => actions.value.filter(({state}) => state !== 'success'))
</script>

<template>
    <div class='control-center'>
        <Icon
            name="oi-hash"
            :color="linkedIssue ? 'green' : 'gray'"
            :hide-pill="linkedIssue?.issueNumber === undefined"
            :pill-text="linkedIssue?.issueNumber"
            title="Issue link provided in first comment"
            style="cursor: pointer;"
            @click="() => GM_openInTab(linkedIssue?.href ?? '', { /* TODO: open in '_blank' target */ })"
        />

        <Icon name="oi-chevron-down" />

        <Icon
            name="oi-tasklist"
            :color="unaddressedTasks.length ? 'red' : 'green'"
            :hide-pill="!unaddressedTasks.length"
            :pill-text="unaddressedTasks.length"
            title="unaddressed issue(s)"
        />

        <Icon name="oi-chevron-down" />

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
 

        <Icon name="oi-chevron-down" />

        <Icon
            name="oi-rocket"
            :color="hasPreviewLabel ? 'green' : 'red'"
            title="Preview Deployment"
        />

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
    position: fixed;
    top: 208px;
    right: 0;
    padding: 4px;
    border: 1px solid gray;
    border-radius: 6px 0 0 6px;
    background-color: var(--bgColor-muted, var(--color-canvas-subtle));
    overflow: hidden;
}

.control-center p {
    margin-bottom: 0;
}
</style>
