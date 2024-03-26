<script setup lang="ts">
import { COLORS, CONTROLL_CENTER_PADDING_LEFT } from '../constants'
import { computed, useSlots } from 'vue'

const slots = useSlots()
const contentSlotDefined = computed(() => !!slots.default)
const headSlotDefined = computed(() => !!slots.head)
</script>

<template>
<div class="wrapper">
    <div class="hover-visible details-pane">
        <div style="overflow: hidden;">
            <div v-if="headSlotDefined" class="head-container" >
                <slot name="head"></slot>
            </div>
            <div v-if="contentSlotDefined" class="content-container">
                <slot></slot>
            </div>
        </div>
        <div class="extended-hover-area"></div>
    </div>
    <div class="icon-container">
        <slot name="icon"></slot>
    </div>
</div>
</template>

<style scoped>
.hover-visible {
    display: none;
}

.wrapper:hover .hover-visible {
    display: unset;
}

.wrapper {
    position: relative;
}

.details-pane {
    position: absolute;
    top: 0;
    left: 0;
    width: max-content;
    max-width: 400px;
    transform: translate(calc(-100% - v-bind('CONTROLL_CENTER_PADDING_LEFT')), -3px);
    z-index: 10;
}

.details-pane::before, .details-pane::after {
    position: absolute;
    top: calc(12.5px + 3px);
    display: block;
    pointer-events: none;
    content: " ";
    transform: translateY(-50%);
    clip-path: polygon(0 0, 100% 50%, 0 100%);
    left: calc(100% - 1px);
}

.details-pane::after {
    width: 4px;
    height: 8px;
    background-color: v-bind('COLORS.bgHighlight');
}

.details-pane::before {
    width: calc((4 + sqrt(2)) * 1px);
    height: calc((4 + sqrt(2)) * 2px);
    background-color: v-bind('COLORS.borderMuted');
}

.extended-hover-area {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 48px;
    transform: translateX(100%);
}

.head-container {
    background-color: v-bind('COLORS.bgHighlight');
    padding: 5px 16px 4px 16px;
    font-weight: 600;

    border: 1px solid v-bind('COLORS.borderMuted');
    border-radius: 6px 0 0 0;
}

.content-container {
    background-color: v-bind('COLORS.bgMuted');
    padding: 8px 16px;

    border: 1px solid v-bind('COLORS.borderMuted');
    border-radius: 0 0 6px 6px;
    border-top: unset;
}

.icon-container {
    position: relative;
    z-index: 20;
}

br {
    border-top: 1px solid v-bind('COLORS.borderHighlight');
}
</style>
