<script setup lang="ts">
import { computed } from 'vue'
import { COLORS } from '../constants'

const props = defineProps<{
    name: string
    title?: string
    color?: keyof typeof COLORS
    pillText?: string | number
    hidePill?: boolean
}>()

const showPill = computed(() => props.hidePill === undefined ? props.pillText : !props.hidePill)
const title = computed(() => [props.title, showPill.value ? props.pillText : ''].filter(Boolean).join(' '))
const fill = computed(() => props.color ?? COLORS.gray)
</script>

<template>
    <div>
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
    background-color: #343941;
    --text-body-size-small: 0.75rem;
    --base-size-20: 0.75rem;
}
</style>
