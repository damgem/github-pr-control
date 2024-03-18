<script setup lang="ts">
import { usePRDetails } from '../composables/usePRState';

const { unaddressedTasks, status, linkedIssue, hasPreviewLabel, stateActions } = usePRDetails()
</script>

<template>
    <div class='control-center'>
        <p v-if="linkedIssue">
            Issue Link
            <a :href="linkedIssue.href ?? ''">{{ linkedIssue?.issueNumber }}</a>
        </p>
        <p v-else>No issue linked</p>

        <p v-if="unaddressedTasks.length">
            Unaddressed tasks:
            <ul>
                <li v-for="task in unaddressedTasks">{{ task }}</li>
            </ul>
        </p>

        <p v-if="Object.values(stateActions).length">
            State:
            <ul>
                <li v-for="[state, actions] of Object.entries(stateActions)">
                    {{ state }}:
                    <ul v-for="action in actions">{{ action }}</ul>
                </li>
            </ul>
        </p>

        <p>Preview Deployment: {{ hasPreviewLabel ? 'Yes' : 'No' }}</p>        

        <v-icon name="oi-rocket" />
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
}

.control-center p:last-of-type {
    margin-bottom: 0;
}
</style>
