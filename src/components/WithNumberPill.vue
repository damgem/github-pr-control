<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
    count: number,
    subjectDescription?: string,
    hideZeroPill: boolean
}>(), {
    hideZeroPill: false
})

const title = computed(() => [props.count, props.subjectDescription].filter(Boolean).join(' '))
</script>

<template>
    <div>
        <slot></slot>
    </div>
    <!-- `Counter` is a class globally defined by GitHub -->
    <span v-if="count !== 0 || !hideZeroPill" :title class="Counter">{{ count }}</span>
</template>

<style scoped>
div {
    display: inline-block
}

span {
    --text-body-size-small: 0.75rem;
    --base-size-20: 0.75rem;
    padding: 0 3px;
    background-color: #343941;
    transform: translate(calc(-50% - 4px), 3px);
}
</style>
