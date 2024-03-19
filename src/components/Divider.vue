<script setup lang="ts">
import { COLORS } from '../constants'

withDefaults(defineProps<{
    type: 'chevron' | 'line'
}>(), {
    type: 'chevron'
})
</script>

<template>
    <div v-if="type === 'chevron'">
        <v-icon
            name="oi-chevron-down"
            :fill="COLORS.gray"
            scale="1.33"
        />
    </div>
    <hr v-else>
</template>

<style scoped>
div {
    display: block;
}

hr {
    border: 1.33px solid #848D97;
    border-radius: 2px;
    max-width: 25.53px;
}
</style>
