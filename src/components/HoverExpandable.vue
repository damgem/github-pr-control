<script setup lang="ts">
import { COLORS, CONTROLL_CENTER_PADDING } from '../constants'
</script>

<template>
<div class="wrapper">
    <div class="expandable">
        <div class="content">
            <div class="title">
                <slot name="title"></slot>
            </div>
            <slot></slot>
        </div>
        <div class="extended-hover-area"></div>
    </div>
    <div class="icon">
        <slot name="icon"></slot>
    </div>
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

.icon {
    position: relative;
    z-index: 20;
}

.content {
    margin-right: v-bind('CONTROLL_CENTER_PADDING');
    border: 1px solid v-bind('COLORS.borderMuted');
    border-radius: 6px 0 6px 6px;
    padding: 8px 16px;
    background-color: v-bind('COLORS.bgMuted');
    min-width: 500px;
    transform: translateY(-3px);
}

.extended-hover-area {
    margin-right: -20px;
    min-width: 20px;
    max-width: 20px;
}

.content::before, .content::after {
    position: absolute;
    top: calc(12.5px + 3px);
    display: block;
    pointer-events: none;
    content: " ";
    transform: translateY(-50%);
    clip-path: polygon(0 0, 100% 50%, 0 100%);
    left:100%;
}

.content::after {
    width: 4px;
    height: 8px;
    background-color: v-bind('COLORS.bgHighlight');
}

.content::before {
    width: calc((4 + sqrt(2)) * 1px);
    height: calc((4 + sqrt(2)) * 2px);
    background-color: v-bind('COLORS.borderMuted');
}

.title {
    background-color: v-bind('COLORS.bgHighlight');
    margin: -8px -16px 8px -16px;
    padding: 5px 16px 4px;
    border-bottom: 1px solid v-bind('COLORS.borderHighlight');
    border-radius: 6px 0 0 0;
    font-weight: 600;
}
</style>
