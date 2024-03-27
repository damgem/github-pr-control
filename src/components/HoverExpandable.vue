<script setup lang="ts">
import { COLORS, CONTROLL_CENTER_PADDING_LEFT } from '../constants'

withDefaults(defineProps<{
    onlyHead: boolean
}>(), {
    onlyHead: false,
})
</script>

<template>
<div class="wrapper">
    <div class="hover-visible details-pane" :class="{ soloHead: onlyHead }">
        <div style="overflow: hidden;">
            <div class="head-container" :class="{ solo: onlyHead }">
                <slot name="head"></slot>
            </div>
            <div v-if="!onlyHead" class="content-container">
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

.details-pane.soloHead::after {
    background-color: v-bind('COLORS.bgMuted');
}

.extended-hover-area {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 48px;
    transform: translateX(100%);
}

.head-container:not(.solo) {
    background-color: v-bind('COLORS.bgHighlight');
    font-weight: 600;

    border: 1px solid v-bind('COLORS.borderMuted');
    border-radius: 6px 0 0 0;
}

.head-container {
    padding: 4px 16px;
}

.content-container, .head-container.solo {
    background-color: v-bind('COLORS.bgMuted');
    border: 1px solid v-bind('COLORS.borderMuted');
    border-radius: 6px;
    border-top-right-radius: 0;
}

.head-container.solo {
    color: v-bind('COLORS.fgMuted');
    border-bottom-right-radius: 0;
}

.content-container {
    padding: 8px 16px;
    border-top-left-radius: 0;
    border-top: unset;
    overflow-y: scroll;
    max-height: 50vh;
}

.icon-container {
    position: relative;
    z-index: 20;
}
</style>
