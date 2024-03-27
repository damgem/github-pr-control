<script setup lang="ts">
import { computed } from 'vue'
import { Color } from '../types'
import { COLORS } from '../constants'

const props = defineProps<{
    name: string
    title?: string
    color?: Color
    pillText?: string | number
    hidePill?: boolean,
    clickEffect?: () => void,
}>()

const pillText = computed(() => typeof props.pillText === 'number' ? String(props.pillText) : props.pillText)

const showPill = computed(() => props.hidePill === undefined ? !!pillText.value : !props.hidePill)
const title = computed(() => [showPill.value ? pillText.value : '', props.title].filter(Boolean).join(' '))
const fill = computed(() => COLORS[props.color ?? 'fgMuted'])
</script>

<template>
    <div @click="clickEffect" :style="{ cursor: clickEffect ? 'pointer' : undefined }">
        <v-icon :name :fill :title scale="1.33" />
        <!-- `Counter` is a class globally defined by GitHub -->
        <span v-if="showPill" :title class="Counter">{{ pillText }}</span>
    </div>
</template>

<style scoped>
div {
    display: block;
    position: relative;
}

span {
    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate(calc(50% - 3px), calc(50% - 3px));
    padding: 0 3px;
    color: v-bind('COLORS.fgMuted');
    background-color: v-bind('COLORS.pillBg');
    user-select: none;
    --text-body-size-small: 0.75rem;
    --base-size-20: 0.75rem;
}
</style>
