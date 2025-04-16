<script setup lang="ts">
    import type { ButtonComponentProps } from '../types/components';

    defineProps<ButtonComponentProps>();
</script>

<template>
    <button :id="id" :type="type ?? 'submit'" :class="className" :style="style" :disabled="disabled" @click="onClick">
        {{ label }}
    </button>
</template>

<style scoped>
</style>