<script setup lang="ts">
import { usePRDetails } from '../composables/usePRState';
import { COLORS } from '../constants'
import { copyShareable } from '../copyShareable';
import Divider from './Divider.vue'
import WithNumberPill from './WithNumberPill.vue'

const { unaddressedTasks, status, linkedIssue, hasPreviewLabel, stateActions } = usePRDetails()
</script>

<template>
    <div class='control-center'>
        <p>
            <a :href="linkedIssue?.href ?? ''" target="_blank">
                <v-icon name="oi-hash" :fill="linkedIssue ? COLORS.green : COLORS.gray" scale="1.33" />{{ linkedIssue?.issueNumber }}
            </a>
        </p>

        <Divider />

        <WithNumberPill :count="unaddressedTasks.length" subject-description="unaddressed issue(s)" hide-zero-pill>
            <v-icon name="oi-tasklist" :fill="unaddressedTasks.length ? COLORS.red : COLORS.green" scale="1.33" />
        </WithNumberPill>

        <p v-if="unaddressedTasks.length">
        <ul>
            <li v-for="task in unaddressedTasks">{{ task }}</li>
        </ul>
        </p>

        <Divider />

        <p>
        <p v-if="stateActions.success">
            <v-icon name="oi-check-circle" :fill="COLORS.green" scale="1.33" />
            Success
        <ul>
            <li v-for="action in stateActions.success">{{ action }}</li>
        </ul>
        </p>

        <p v-if="stateActions.problem">
            <v-icon name="oi-alert" :fill="COLORS.orange" scale="1.33" /> Problem
        <ul>
            <li v-for="action in stateActions.problem">{{ action }}</li>
        </ul>
        </p>

        <p v-if="stateActions.error">
            <v-icon name="oi-x-circle" :fill="COLORS.red" scale="1.33" /> Error
        <ul>
            <li v-for="action in stateActions.error">{{ action }}</li>
        </ul>
        </p>

        <p v-if="stateActions['undefined-state']">
            <v-icon name="oi-question" scale="1.33" /> Other
        <ul>
            <li v-for="action in stateActions['undefined-state']">{{ action }}</li>
        </ul>
        </p>
        </p>

        <Divider />

        <p>
            <v-icon name="oi-rocket" title="Preview Deployment" :fill="hasPreviewLabel ? COLORS.green : COLORS.red"
                scale="1.33" />
        </p>

        <Divider type="line"/>

        <a @click="() => copyShareable(true)">
            <v-icon name="oi-share-android" title="Copy PR title & URL" scale="1.33" />
        </a>
        <a @click="() => copyShareable(true)">
            <v-icon name="oi-share-android" title="Copy PR title & URL" scale="1.33" />
        </a>
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

.control-center p {
    margin-bottom: 0;
}
</style>
