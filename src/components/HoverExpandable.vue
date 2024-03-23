<script setup lang="ts">
import { COLORS, CONTROLL_CENTER_PADDING } from '../constants'

withDefaults(defineProps<{
    disableHover: boolean
}>(), {
    disableHover: false
})
</script>

<template>
<div class="wrapper">
    <div v-if="!disableHover" class="expandable">
        <div class="content">
            <slot></slot>
        </div>
        <div class="extended-hover-area"></div>
    </div>
    <slot name="icon"></slot>
</div>
</template>

<style scoped>
.expandable {
    display: none;
    position: absolute;
    transform: translateX(-100%);
    z-index: 10;
}

.wrapper:hover .expandable {
    display: flex
}

.content {
    margin-right: v-bind('CONTROLL_CENTER_PADDING');
    border: 1px solid gray;
    border-radius: 6px 0 6px 6px;
    padding: 4px;
    background-color: v-bind('COLORS.bgMuted');
    min-width: 500px;
}

.extended-hover-area {
    margin-right: -20px;
    min-width: 20px;
    max-width: 20px;
}
</style>
