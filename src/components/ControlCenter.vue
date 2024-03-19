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
            :pill-text="linkedIssue?.issueNumber"
            title="Issue link provided in first comment"
            :hide-pill="linkedIssue?.issueNumber === undefined"
            :color="linkedIssue ? 'green' : 'gray'"
            @click="() => GM_openInTab(linkedIssue?.href ?? '', { /* TODO: open in '_blank' target */ })"
        />

        <Icon name="oi-chevron-down" />

        <Icon
            name="oi-tasklist"
            :pill-text="unaddressedTasks.length"
            :hide-pill="!unaddressedTasks.length"
            title="unaddressed issue(s)"
            :color="unaddressedTasks.length ? 'red' : 'green'"
        />

        <Icon name="oi-chevron-down" />

        <Icon
            v-if="nonSuccessActions.length === 0"
            :pill-text="unaddressedTasks.length"
            title="successful action(s)"
            name="oi-check-circle"
            color="green"
        />
        <Icon
            v-else
            name="oi-x-circle"
            :pill-text="nonSuccessActions.length"
            title="erronous action(s)"
            color="red"
        />

        <Icon name="oi-chevron-down" />

        <Icon name="oi-rocket" title="Preview Deployment" :color="hasPreviewLabel ? 'green' : 'red'"/>

        <Icon name="oi-horizontal-rule" style="margin: -3px 0;"/>

        <Icon name="oi-share-android" title="Copy PR title & URL" @click="() => copyShareable(true)"/>
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
</style>./Icon.vue
